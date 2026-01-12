import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';

const AdminScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, success, error
  const [message, setMessage] = useState('Ready to Scan');

  const handleScan = async (result, error) => {
    // 1. If no result or already processing, do nothing
    if (!result?.text || scanStatus === 'processing') return;

    try {
      setScanStatus('processing');
      setMessage('Verifying...');

      // 2. Parse the QR Data (expecting JSON string from our backend)
      // The QR contains: { ticketId, eventId, userId, ... }
      const parsedData = JSON.parse(result.text);

      // 3. Call the API
      const res = await axios.post(
        '/api/v1/tickets/scan',
        { ticketId: parsedData.ticketId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Admin Token
          },
        }
      );

      // 4. Handle Success
      setScanStatus('success');
      setScanResult(res.data.data);
      setMessage(`ACCESS GRANTED: ${res.data.data.attendee}`);

      // Reset after 3 seconds to scan the next person
      setTimeout(() => resetScanner(), 3000);

    } catch (err) {
      console.error(err);
      setScanStatus('error');
      
      // Handle Specific Errors
      if (err.response?.status === 409) {
        setMessage('⚠️ ALREADY SCANNED! Duplicate Entry.');
      } else if (err.response?.status === 404) {
        setMessage('❌ INVALID TICKET.');
      } else {
        setMessage('Error verifying ticket.');
      }

      // Reset after 3 seconds
      setTimeout(() => resetScanner(), 3000);
    }
  };

  const resetScanner = () => {
    setScanStatus('idle');
    setScanResult(null);
    setMessage('Ready to Scan');
  };

  // UI Styles based on status
  const getStatusColor = () => {
    if (scanStatus === 'success') return 'bg-green-500';
    if (scanStatus === 'error') return 'bg-red-600';
    if (scanStatus === 'processing') return 'bg-blue-500';
    return 'bg-gray-800';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-6">Event Entry Scanner</h1>

      {/* Camera Viewport */}
      <div className={`relative w-full max-w-md aspect-square rounded-xl overflow-hidden border-4 ${
        scanStatus === 'success' ? 'border-green-500' : 
        scanStatus === 'error' ? 'border-red-500' : 'border-gray-500'
      }`}>
        {/* Only activate camera when idle/scanning to save battery/resources */}
        {scanStatus === 'idle' && (
            <QrReader
                onResult={(result, error) => {
                    if (!!result) {
                        handleScan(result, error);
                    }
                }}
                constraints={{ facingMode: 'environment' }} // Use Back Camera
                className="w-full h-full object-cover"
                scanDelay={500}
            />
        )}
        
        {/* Overlay for Processing/Success/Error */}
        {scanStatus !== 'idle' && (
            <div className={`absolute inset-0 flex flex-col items-center justify-center ${getStatusColor()} bg-opacity-90`}>
                <p className="text-4xl font-bold text-center px-4">{message}</p>
                {scanResult && (
                    <div className="mt-4 text-center">
                        <p className="text-xl">{scanResult.type}</p>
                        <p className="text-sm opacity-75">Checked in at: {new Date(scanResult.timestamp).toLocaleTimeString()}</p>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Manual Reset Button (just in case) */}
      <button 
        onClick={resetScanner}
        className="mt-8 px-8 py-3 bg-gray-700 rounded-full font-bold hover:bg-gray-600"
      >
        Reset Scanner
      </button>

      <p className="mt-4 text-gray-400 text-sm">
        Point camera at the attendee's QR code
      </p>
    </div>
  );
};

export default AdminScanner;