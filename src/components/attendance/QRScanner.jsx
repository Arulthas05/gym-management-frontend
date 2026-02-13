import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import Webcam from 'react-webcam';
import { toast } from 'react-toastify';

const QRScanner = ({ open, onClose, onScan }) => {
  const [scanning, setScanning] = useState(false);
  const webcamRef = React.useRef(null);

  const handleCapture = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      toast.error('Failed to capture image');
      return;
    }

    // In a real implementation, you would use a QR code library to decode the image
    // For now, we'll simulate a scan
    try {
      setScanning(true);
      // Simulate QR decode - in production use jsQR or similar library
      const mockQRData = JSON.stringify({ memberId: 1, timestamp: Date.now() });
      await onScan(mockQRData);
    } catch (error) {
      toast.error('Failed to scan QR code');
    } finally {
      setScanning(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Scan QR Code</DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center' }}>
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            style={{ width: '100%', maxWidth: 400 }}
          />
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Position the QR code in front of the camera
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCapture} variant="contained" disabled={scanning}>
          {scanning ? 'Scanning...' : 'Capture & Scan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRScanner;