import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Keyboard } from 'lucide-react';
import toast from 'react-hot-toast';

// 1. FIX IMPORT: Import the service function
import { scanTicket } from '../../services/bookingService'; 

const ScannerPage = () => {
  const { eventId } = useParams();
  
  // Scanner State
  const [status, setStatus] = useState('idle'); 
  const [scanResult, setScanResult] = useState(null);
  const [message, setMessage] = useState('Ready to Scan');
  const [pauseScanner, setPauseScanner] = useState(false); // To stop scanning after success
  
  // Manual Entry State
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');

  // 1. Handle Automatic QR Scan (Updated for @yudiel/react-qr-scanner)
  const handleScan = async (detectedCodes) => {
    // The new library returns an array of objects
    const rawValue = detectedCodes?.[0]?.rawValue;

    if (!rawValue || status !== 'idle' || pauseScanner) return;

    try {
      setPauseScanner(true); // Pause immediately
      // const parsedData = JSON.parse(rawValue);
      // await processTicket(parsedData.ticketId);

      await processTicket(rawValue);
    } catch (err) {
      console.error("Scan Error", err);
      // If valid QR but not JSON, resume scanning
      setPauseScanner(false);
    }
  };

  // 2. Handle Manual Input Submit
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    
    await processTicket(manualCode.trim());
    setShowManualInput(false);
    setManualCode('');
  };

  // 3. Centralized Ticket Processing Logic
  const processTicket = async (qrData) => {
    try {
      setStatus('processing');
      setMessage('Verifying...');

      // 2. FIX VARIABLE NAME: Use 'res' consistently
      const res = await scanTicket(qrData);

      setStatus('success');
      setScanResult(res.data); // Assuming your service returns response.data
      setMessage(`GRANTED: ${res.data.attendee}`);
      toast.success("Entry Granted!");

    } catch (err) {
      console.error(err);
      if (err.response?.status === 409) {
        setStatus('duplicate');
        setMessage('ALREADY SCANNED!');
        toast.error("Duplicate Ticket!");
      } else {
        setStatus('error');
        setMessage('INVALID TICKET');
        toast.error("Invalid Ticket ID");
      }
    } finally {
      // Auto-reset after 2.5s
      setTimeout(resetScanner, 2500);
    }
  };

  const resetScanner = () => {
    setStatus('idle');
    setScanResult(null);
    setMessage('Ready to Scan');
    setPauseScanner(false); // Resume camera
  };

  const getBorderColor = () => {
    if (status === 'success') return 'border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.5)]';
    if (status === 'error') return 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)]';
    if (status === 'duplicate') return 'border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.5)]';
    return 'border-gray-600';
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <Link to="/organizer/dashboard" className="p-2 bg-[#222] rounded-full hover:bg-[#333]">
            <ArrowLeft size={20} />
        </Link>
        <h2 className="font-bold text-lg">Event Entry</h2>
        <div className="w-10"></div>
      </div>

      {/* Main Scanner Viewport */}
      <div className={`relative w-full max-w-md aspect-square bg-[#111] rounded-3xl overflow-hidden border-4 transition-all duration-300 ${getBorderColor()}`}>
        
        {/* 3. FIX SCANNER: Use correct props for new library */}
        {status === 'idle' && !showManualInput && (
             <Scanner 
                onScan={handleScan} // Use onScan, not onResult
                allowMultiple={true}
                scanDelay={500}
                paused={pauseScanner}
                components={{
                  audio: false, 
                  finder: false 
                }}
                styles={{
                  container: { width: '100%', height: '100%' },
                  video: { objectFit: 'cover' }
                }}
            />
        )}

        {/* Manual Input Form Overlay */}
        {showManualInput && status === 'idle' && (
            <div className="absolute inset-0 bg-[#111] flex flex-col items-center justify-center p-6 z-20">
                <h3 className="text-xl font-bold mb-4">Manual Check-in</h3>
                <form onSubmit={handleManualSubmit} className="w-full">
                    <input 
                        type="text" 
                        placeholder="Enter Ticket ID" 
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        className="w-full bg-[#222] border border-[#333] text-white p-4 rounded-xl mb-4 text-center text-lg focus:outline-none focus:border-red-500"
                        autoFocus
                    />
                    <button type="submit" className="w-full bg-red-600 py-3 rounded-xl font-bold">
                        Check In
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setShowManualInput(false)}
                        className="w-full mt-3 py-2 text-gray-500 text-sm"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        )}

        {/* Status Overlay (Success/Error) */}
        {status !== 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in z-30">
                {status === 'success' && <CheckCircle className="text-green-500 w-24 h-24 mb-4" />}
                {status === 'error' && <XCircle className="text-red-500 w-24 h-24 mb-4" />}
                {status === 'duplicate' && <AlertTriangle className="text-yellow-500 w-24 h-24 mb-4" />}
                
                <h3 className="text-2xl font-bold text-center px-4">{message}</h3>
                {scanResult && <p className="mt-2 text-gray-400">{scanResult.type}</p>}
            </div>
        )}
      </div>

      <p className="mt-6 text-gray-500 text-sm">
        {showManualInput ? "Enter the alphanumeric ID below the QR code." : "Point camera at attendee's QR code"}
      </p>

      {/* Toggle Manual/Camera Button */}
      {!showManualInput && (
        <button 
            onClick={() => setShowManualInput(true)}
            className="mt-8 flex items-center gap-2 px-6 py-3 bg-[#222] rounded-full hover:bg-[#333] transition"
        >
            <Keyboard size={18} />
            Enter Code Manually
        </button>
      )}
    </div>
  );
};

export default ScannerPage;