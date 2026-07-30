import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { uploadCarImages, deleteCarImage, setCoverImage } from '../services/carService.js';

const ACCENTS = ['amber', 'jade', 'dusk'];
const TRANSMISSIONS = ['Automatic', 'Manual'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'EV'];
const CATEGORIES = ['SUV', 'Sedan', 'Luxury'];

function CarForm({ initialValue, onCancel, onSave, onImagesChanged }) {
  const { token, logout } = useAuth();
  const isEdit = Boolean(initialValue);

  const [id, setId] = useState(initialValue?.id || '');
  const [name, setName] = useState(initialValue?.name || '');
  const [tagline, setTagline] = useState(initialValue?.tagline || '');
  const [seats, setSeats] = useState(initialValue?.seats ?? 5);
  const [transmission, setTransmission] = useState(initialValue?.transmission || 'Automatic');
  const [fuelType, setFuelType] = useState(initialValue?.fuelType || 'Petrol');
  const [category, setCategory] = useState(initialValue?.category || 'Sedan');
  const [pricePerHour, setPricePerHour] = useState(initialValue?.pricePerHour ?? 15);
  const [pricePerHalfDay, setPricePerHalfDay] = useState(initialValue?.pricePerHalfDay ?? 70);
  const [pricePerDay, setPricePerDay] = useState(initialValue?.pricePerDay ?? 120);
  const [accent, setAccent] = useState(initialValue?.accent || 'amber');
  const [saving, setSaving] = useState(false);

  const [images, setImages] = useState(initialValue?.images || []);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...(isEdit ? {} : { id: id.trim().toLowerCase() }),
      name: name.trim(),
      tagline: tagline.trim(),
      seats: Number(seats),
      transmission,
      fuelType,
      category,
      pricePerHour: Number(pricePerHour),
      pricePerHalfDay: Number(pricePerHalfDay),
      pricePerDay: Number(pricePerDay),
      accent,
    };

    await onSave(payload);
    setSaving(false);
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setImageError('');
    setUploading(true);
    try {
      const uploaded = await uploadCarImages(token, initialValue.id, files);
      const next = [...images, ...uploaded];
      setImages(next);
      onImagesChanged?.(next);
    } catch (err) {
      if (err.status === 401) return logout();
      setImageError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleDeleteImage(imageId) {
    setImageError('');
    try {
      await deleteCarImage(token, initialValue.id, imageId);
      const next = images.filter((img) => img.id !== imageId);
      setImages(next);
      onImagesChanged?.(next);
    } catch (err) {
      if (err.status === 401) return logout();
      setImageError(err.message || 'Could not delete image');
    }
  }

  async function handleSetCover(imageId) {
    setImageError('');
    try {
      const next = await setCoverImage(token, initialValue.id, imageId);
      setImages(next);
      onImagesChanged?.(next);
    } catch (err) {
      if (err.status === 401) return logout();
      setImageError(err.message || 'Could not update cover photo');
    }
  }

  return (
    <form className="car-form" onSubmit={handleSubmit}>
      <h3>{isEdit ? `Edit ${initialValue.name}` : 'Add a new car'}</h3>

      <div className="form-grid">
        {!isEdit && (
          <div className="field">
            <label htmlFor="carId">ID (used internally, e.g. &ldquo;myvi&rdquo;)</label>
            <input
              id="carId"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              pattern="[a-z0-9-]+"
              title="Lowercase letters, numbers, and hyphens only"
              required
            />
          </div>
        )}
        <div className="field">
          <label htmlFor="carName">Name</label>
          <input id="carName" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="carTagline">Tagline</label>
          <input
            id="carTagline"
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="carSeats">Seats</label>
          <input
            id="carSeats"
            type="number"
            min="1"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="carTransmission">Transmission</label>
          <select id="carTransmission" value={transmission} onChange={(e) => setTransmission(e.target.value)}>
            {TRANSMISSIONS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="carFuel">Fuel type</label>
          <select id="carFuel" value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
            {FUEL_TYPES.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="carCategory">Category</label>
          <select id="carCategory" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="carAccent">Card color</label>
          <select id="carAccent" value={accent} onChange={(e) => setAccent(e.target.value)}>
            {ACCENTS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="carPriceHour">Price per hour (RM)</label>
          <input
            id="carPriceHour"
            type="number"
            min="1"
            value={pricePerHour}
            onChange={(e) => setPricePerHour(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="carPriceHalfDay">Price per half-day (RM)</label>
          <input
            id="carPriceHalfDay"
            type="number"
            min="1"
            value={pricePerHalfDay}
            onChange={(e) => setPricePerHalfDay(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="carPriceDay">Price per day (RM)</label>
          <input
            id="carPriceDay"
            type="number"
            min="1"
            value={pricePerDay}
            onChange={(e) => setPricePerDay(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="image-section">
        <label>Photos</label>
        {!isEdit && (
          <p className="image-hint">Save the car first — you can add photos once it exists.</p>
        )}
        {isEdit && (
          <>
            {images.length > 0 && (
              <div className="image-thumbs">
                {images.map((img) => (
                  <div className="image-thumb" key={img.id}>
                    <img src={img.url} alt="" />
                    {img.sortOrder === 0 && <span className="image-cover-badge">Cover</span>}
                    <div className="image-thumb-actions">
                      {img.sortOrder !== 0 && (
                        <button type="button" onClick={() => handleSetCover(img.id)}>
                          Set cover
                        </button>
                      )}
                      <button type="button" onClick={() => handleDeleteImage(img.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleUpload}
              disabled={uploading}
            />
            {uploading && <p className="image-hint">Uploading…</p>}
            {imageError && <p className="form-error">{imageError}</p>}
          </>
        )}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

export default CarForm;
