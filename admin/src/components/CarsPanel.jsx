import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchCars,
  createCar,
  updateCar,
  deleteCar,
  setCarCondition,
  setCarActive,
} from '../services/carService.js';
import CarForm from './CarForm.jsx';

const CONDITIONS = [
  { value: 'in_service', label: 'In service' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'broken', label: 'Broken' },
];

function CarsPanel() {
  const { token, logout } = useAuth();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [editingCar, setEditingCar] = useState(null); // null | 'new' | a car object

  function load() {
    setLoading(true);
    fetchCars(token)
      .then(setCars)
      .catch((err) => {
        if (err.status === 401) return logout();
        setError(err.message || 'Failed to load cars');
      })
      .finally(() => setLoading(false));
  }

  // Same standard fetch-on-mount pattern noted in BookingsPanel.jsx.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, [token, logout]);

  async function handleSave(payload) {
    setActionError('');
    try {
      if (editingCar === 'new') {
        await createCar(token, payload);
      } else {
        await updateCar(token, editingCar.id, payload);
      }
      setEditingCar(null);
      load();
    } catch (err) {
      if (err.status === 401) return logout();
      setActionError(err.message || 'Could not save car');
    }
  }

  async function handleDelete(car) {
    if (!window.confirm(`Delete ${car.name}? This can't be undone.`)) return;

    setActionError('');
    try {
      await deleteCar(token, car.id);
      load();
    } catch (err) {
      if (err.status === 401) return logout();
      setActionError(err.message || 'Could not delete car');
    }
  }

  async function handleConditionChange(car, condition) {
    setActionError('');
    try {
      const updated = await setCarCondition(token, car.id, condition);
      setCars((prev) => prev.map((c) => (c.id === car.id ? { ...c, ...updated } : c)));
    } catch (err) {
      if (err.status === 401) return logout();
      setActionError(err.message || 'Could not update condition');
    }
  }

  async function handleToggleActive(car) {
    setActionError('');
    try {
      const updated = await setCarActive(token, car.id, !car.isActive);
      setCars((prev) => prev.map((c) => (c.id === car.id ? { ...c, ...updated } : c)));
    } catch (err) {
      if (err.status === 401) return logout();
      setActionError(err.message || 'Could not update status');
    }
  }

  function handleImagesChanged(carId, images) {
    setCars((prev) => prev.map((c) => (c.id === carId ? { ...c, images } : c)));
  }

  return (
    <div className="panel">
      <div className="panel-toolbar">
        <button className="btn btn-primary" onClick={() => setEditingCar('new')}>
          + Add car
        </button>
        <span className="panel-count">
          {cars.length} car{cars.length === 1 ? '' : 's'}
        </span>
      </div>

      {actionError && <p className="form-error">{actionError}</p>}

      {editingCar && (
        <CarForm
          initialValue={editingCar === 'new' ? null : editingCar}
          onCancel={() => setEditingCar(null)}
          onSave={handleSave}
          onImagesChanged={(images) => handleImagesChanged(editingCar.id, images)}
        />
      )}

      {loading && <p className="state-message">Loading cars…</p>}
      {error && <p className="state-message state-error">{error}</p>}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="data-table cars-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Car</th>
                <th>Category</th>
                <th>Fuel</th>
                <th>Seats</th>
                <th>Pricing</th>
                <th>Listed</th>
                <th>Condition</th>
                <th className="actions-col" aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => {
                const cover = car.images?.[0];
                const canToggle = car.condition === 'in_service';
                return (
                  <tr key={car.id}>
                    <td>
                      {cover ? (
                        <img className="row-thumb" src={cover.url} alt="" />
                      ) : (
                        <span className="row-thumb row-thumb-empty">No photo</span>
                      )}
                    </td>
                    <td>
                      <strong>{car.name}</strong>
                      <div className="table-muted">{car.tagline}</div>
                    </td>
                    <td>{car.category}</td>
                    <td>{car.fuelType}</td>
                    <td>{car.transmission} · {car.seats}</td>
                    <td className="table-muted">
                      RM{car.pricePerHour}/hr · RM{car.pricePerHalfDay}/half · RM{car.pricePerDay}/day
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`status-toggle${car.isActive ? ' status-toggle-on' : ''}`}
                        onClick={() => handleToggleActive(car)}
                        disabled={!canToggle}
                        title={
                          canToggle
                            ? car.isActive
                              ? 'Visible on the public site — click to hide'
                              : 'Hidden from the public site — click to list'
                            : 'Set condition to "In service" to change this'
                        }
                      >
                        <span className="status-toggle-dot" />
                        {car.isActive ? 'Listed' : 'Hidden'}
                      </button>
                    </td>
                    <td>
                      <select
                        className="filter-select condition-select"
                        value={car.condition}
                        onChange={(e) => handleConditionChange(car, e.target.value)}
                      >
                        {CONDITIONS.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="table-actions actions-col">
                      <button className="btn btn-outline btn-sm" onClick={() => setEditingCar(car)}>
                        Edit
                      </button>
                      <button className="btn btn-outline btn-sm btn-danger" onClick={() => handleDelete(car)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CarsPanel;
