const pool = require('../config/db');

function toImageDto(row) {
  return { id: row.id, carId: row.car_id, url: row.url, storagePath: row.storage_path, sortOrder: row.sort_order };
}

const imageRepository = {
  async findByCarId(carId) {
    const { rows } = await pool.query(
      'SELECT * FROM car_images WHERE car_id = $1 ORDER BY sort_order ASC',
      [carId]
    );
    return rows.map(toImageDto);
  },

  async findById(imageId) {
    const { rows } = await pool.query('SELECT * FROM car_images WHERE id = $1', [imageId]);
    return rows[0] ? toImageDto(rows[0]) : null;
  },

  /** New images append after whatever the current highest sortOrder is. */
  async create({ carId, url, storagePath }) {
    const { rows: maxRows } = await pool.query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM car_images WHERE car_id = $1',
      [carId]
    );
    const { rows } = await pool.query(
      `INSERT INTO car_images (car_id, url, storage_path, sort_order) VALUES ($1, $2, $3, $4) RETURNING *`,
      [carId, url, storagePath, maxRows[0].next_order]
    );
    return toImageDto(rows[0]);
  },

  async remove(imageId) {
    const { rowCount } = await pool.query('DELETE FROM car_images WHERE id = $1', [imageId]);
    return rowCount > 0;
  },

  /** Moves one image to sortOrder 0 (cover photo) and shifts the rest down. */
  async makeCover(carId, imageId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE car_images SET sort_order = sort_order + 1 WHERE car_id = $1 AND id != $2`,
        [carId, imageId]
      );
      await client.query(`UPDATE car_images SET sort_order = 0 WHERE id = $1`, [imageId]);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};

module.exports = imageRepository;
