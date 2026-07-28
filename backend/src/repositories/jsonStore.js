const fs = require('fs');
const path = require('path');

/**
 * Minimal file-backed JSON store — good enough for a small business's
 * booking volume, and dependency-free to run. Swap this one file for a
 * real database client later; services and controllers won't need to change.
 */
class JsonStore {
  constructor(fileName, defaultData = []) {
    this.filePath = path.join(__dirname, '..', '..', 'data', fileName);
    if (!fs.existsSync(this.filePath)) {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(defaultData, null, 2));
    }
  }

  readAll() {
    const raw = fs.readFileSync(this.filePath, 'utf-8');
    return JSON.parse(raw || '[]');
  }

  writeAll(records) {
    fs.writeFileSync(this.filePath, JSON.stringify(records, null, 2));
  }
}

module.exports = JsonStore;
