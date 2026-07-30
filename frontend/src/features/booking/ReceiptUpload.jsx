import { useState } from 'react';
import { confirmPayment } from '../../services/bookingService.js';
import Button from '../../components/Button.jsx';

function ReceiptUpload({ bookingId, onConfirmed, onCancel }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const booking = await confirmPayment(bookingId, file);
      onConfirmed(booking);
    } catch (err) {
      setError(err.message || 'Could not upload receipt. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <form className="receipt-upload" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="receiptFile">Payment receipt (photo or screenshot)</label>
        <input
          id="receiptFile"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="receipt-upload-actions">
        <Button type="button" variant="outline" onClick={onCancel} disabled={uploading}>
          Back
        </Button>
        <Button type="submit" disabled={!file || uploading}>
          {uploading ? 'Uploading…' : 'Submit receipt'}
        </Button>
      </div>
    </form>
  );
}

export default ReceiptUpload;
