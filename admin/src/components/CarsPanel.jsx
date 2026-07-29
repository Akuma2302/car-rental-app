import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchCars, createCar, updateCar, deleteCar } from '../services/carService.js';
import CarForm from './CarForm.jsx';

function CarsPanel() {
  const { token, logout } = useAuth();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [editingCar, setEditingCar] = useState(null); // null | 'new' | a car object

  function load() {
    setLoading(true);
    fetchCars()
      .then(setCars)
      .catch((err) => setError(err.message || 'Failed to load cars'))
      .finally(() => setLoading(false));
  }

  // Same standard fetch-on-mount pattern noted in BookingsPanel.jsx.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, []);

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
        />
      )}

      {loading && <p className="state-message">Loading cars…</p>}
      {error && <p className="state-message state-error">{error}</p>}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Car</th>
                <th>Seats</th>
                <th>Transmission</th>
                <th>Price/day</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car.id}>
                  <td>
                    <strong>{car.name}</strong>
                    <div className="table-muted">{car.tagline}</div>
                  </td>
                  <td>{car.seats}</td>
                  <td>{car.transmission}</td>
                  <td>RM{car.pricePerDay}</td>
                  <td className="table-actions">
                    <button className="btn btn-outline btn-sm" onClick={() => setEditingCar(car)}>
                      Edit
                    </button>
                    <button className="btn btn-outline btn-sm btn-danger" onClick={() => handleDelete(car)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CarsPanel;
