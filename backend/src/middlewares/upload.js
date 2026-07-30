const multer = require('multer');

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB per image

// memoryStorage: files land in req.files as in-memory Buffers, never
// touching the server's disk — appropriate since they're immediately
// forwarded to Supabase Storage and Render's disk is ephemeral anyway.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 8 },
});

module.exports = upload;
