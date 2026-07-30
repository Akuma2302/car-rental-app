const crypto = require('crypto');
const path = require('path');
const env = require('../config/env');
const getStorageClient = require('../config/storage');
const carRepository = require('../repositories/carRepository');
const imageRepository = require('../repositories/imageRepository');

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGES_PER_CAR = 8;

const imageService = {
  async uploadImages(carId, files) {
    const car = await carRepository.findById(carId);
    if (!car) {
      const err = new Error('Car not found');
      err.status = 404;
      throw err;
    }

    const existing = await imageRepository.findByCarId(carId);
    if (existing.length + files.length > MAX_IMAGES_PER_CAR) {
      const err = new Error(`A car can have at most ${MAX_IMAGES_PER_CAR} images`);
      err.status = 400;
      throw err;
    }

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        const err = new Error(`Unsupported image type: ${file.mimetype}. Use JPEG, PNG, or WebP.`);
        err.status = 400;
        throw err;
      }
    }

    const supabase = getStorageClient();
    const uploaded = [];

    for (const file of files) {
      const ext = path.extname(file.originalname) || '.jpg';
      const storagePath = `cars/${carId}/${crypto.randomUUID()}${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(env.storageBucket)
        .upload(storagePath, file.buffer, { contentType: file.mimetype, cacheControl: '3600' });

      if (uploadError) {
        const err = new Error(`Image upload failed: ${uploadError.message}`);
        err.status = 502;
        throw err;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(env.storageBucket).getPublicUrl(storagePath);

      const image = await imageRepository.create({ carId, url: publicUrl, storagePath });
      uploaded.push(image);
    }

    return uploaded;
  },

  async deleteImage(carId, imageId) {
    const image = await imageRepository.findById(imageId);
    if (!image || image.carId !== carId) {
      const err = new Error('Image not found');
      err.status = 404;
      throw err;
    }

    const supabase = getStorageClient();
    const { error } = await supabase.storage.from(env.storageBucket).remove([image.storagePath]);
    // A failed Storage delete shouldn't block removing the DB record — log
    // and continue, rather than leaving an orphaned row the admin can't
    // remove because a file already went missing.
    if (error) {
      console.warn(`Could not delete ${image.storagePath} from storage:`, error.message);
    }

    await imageRepository.remove(imageId);
  },

  async setCoverImage(carId, imageId) {
    const image = await imageRepository.findById(imageId);
    if (!image || image.carId !== carId) {
      const err = new Error('Image not found');
      err.status = 404;
      throw err;
    }
    await imageRepository.makeCover(carId, imageId);
    return imageRepository.findByCarId(carId);
  },
};

module.exports = imageService;
