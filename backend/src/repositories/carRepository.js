const pool = require('../config/db');

function toCarDto(row) {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    seats: row.seats,
    transmission: row.transmission,
    fuelType: row.fuel_type,
    category: row.category,
    pricePerHour: row.price_per_hour,
    pricePerHalfDay: row.price_per_half_day,
    pricePerDay: row.price_per_day,
    accent: row.accent,
  };
}

function toImageDto(row) {
  return { id: row.id, url: row.url, sortOrder: row.sort_order };
}

/**
 * Attaches each car's images (ordered by sortOrder) in a single extra
 * query rather than N+1 queries per car.
 */
async function attachImages(cars) {
  if (cars.length === 0) return cars;
  const ids = cars.map((c) => c.id);
  const { rows } = await pool.query(
    `SELECT * FROM car_images WHERE car_id = ANY($1) ORDER BY car_id, sort_order ASC`,
    [ids]
  );
  const byCarId = {};
  for (const row of rows) {
    (byCarId[row.car_id] = byCarId[row.car_id] || []).push(toImageDto(row));
  }
  return cars.map((car) => ({ ...car, images: byCarId[car.id] || [] }));
}

const carRepository = {
  async findAll() {
    const { rows } = await pool.query('SELECT * FROM cars ORDER BY created_at ASC');
    return attachImages(rows.map(toCarDto));
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM cars WHERE id = $1', [id]);
    if (!rows[0]) return null;
    const [withImages] = await attachImages([toCarDto(rows[0])]);
    return withImages;
  },

  async create(data) {
    const { rows } = await pool.query(
      `INSERT INTO cars (id, name, tagline, seats, transmission, fuel_type, category, price_per_hour, price_per_half_day, price_per_day, accent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        data.id,
        data.name,
        data.tagline,
        data.seats,
        data.transmission,
        data.fuelType,
        data.category,
        data.pricePerHour,
        data.pricePerHalfDay,
        data.pricePerDay,
        data.accent,
      ]
    );
    return { ...toCarDto(rows[0]), images: [] };
  },

  async update(id, data) {
    const { rows } = await pool.query(
      `UPDATE cars
       SET name = $2, tagline = $3, seats = $4, transmission = $5, fuel_type = $6,
           category = $7, price_per_hour = $8, price_per_half_day = $9, price_per_day = $10, accent = $11
       WHERE id = $1
       RETURNING *`,
      [
        id,
        data.name,
        data.tagline,
        data.seats,
        data.transmission,
        data.fuelType,
        data.category,
        data.pricePerHour,
        data.pricePerHalfDay,
        data.pricePerDay,
        data.accent,
      ]
    );
    if (!rows[0]) return null;
    const [withImages] = await attachImages([toCarDto(rows[0])]);
    return withImages;
  },

  async remove(id) {
    const { rowCount } = await pool.query('DELETE FROM cars WHERE id = $1', [id]);
    return rowCount > 0;
  },
};

module.exports = carRepository;
