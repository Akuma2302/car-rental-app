import { useState } from 'react';

const ACCENTS = ['amber', 'jade', 'dusk'];

function CarForm({ initialValue, onCancel, onSave }) {
  const isEdit = Boolean(initialValue);

  const [id, setId] = useState(initialValue?.id || '');
  const [name, setName] = useState(initialValue?.name || '');
  const [tagline, setTagline] = useState(initialValue?.tagline || '');
  const [seats, setSeats] = useState(initialValue?.seats ?? 5);
  const [transmission, setTransmission] = useState(initialValue?.transmission || 'Automatic');
  const [pricePerDay, setPricePerDay] = useState(initialValue?.pricePerDay ?? 100);
  const [accent, setAccent] = useState(initialValue?.accent || 'amber');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...(isEdit ? {} : { id: id.trim().toLowerCase() }),
      name: name.trim(),
      tagline: tagline.trim(),
      seats: Number(seats),
      transmission,
      pricePerDay: Number(pricePerDay),
      accent,
    };

    await onSave(payload);
    setSaving(false);
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
            <option>Automatic</option>
            <option>Manual</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="carPrice">Price per day (RM)</label>
          <input
            id="carPrice"
            type="number"
            min="1"
            value={pricePerDay}
            onChange={(e) => setPricePerDay(e.target.value)}
            required
          />
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
