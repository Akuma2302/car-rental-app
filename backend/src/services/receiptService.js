const crypto = require('crypto');
const path = require('path');
const env = require('../config/env');
const getStorageClient = require('../config/storage');

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const receiptService = {
  async uploadReceipt(bookingId, file) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      const err = new Error(`Unsupported file type: ${file.mimetype}. Upload a photo (JPEG, PNG, or WebP).`);
      err.status = 400;
      throw err;
    }

    const supabase = getStorageClient();
    const ext = path.extname(file.originalname) || '.jpg';
    const storagePath = `receipts/${bookingId}/${crypto.randomUUID()}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(env.storageBucket)
      .upload(storagePath, file.buffer, { contentType: file.mimetype, cacheControl: '3600' });

    if (uploadError) {
      const err = new Error(`Receipt upload failed: ${uploadError.message}`);
      err.status = 502;
      throw err;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(env.storageBucket).getPublicUrl(storagePath);

    return { url: publicUrl, storagePath };
  },
};

module.exports = receiptService;
