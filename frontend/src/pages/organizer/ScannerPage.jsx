import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Keyboard, User, Clock, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

// 👇 1. IMPORT BOTH FUNCTIONS
import { scanTicket, checkInManually } from '../../services/bookingService'; 
import { getCheckedInAttendees } from '../../services/organizerService';

const ScannerPage = () => {
  const { eventId } = useParams();
  
  // Scanner State
  const [status, setStatus] = useState('idle'); 
  const [scanResult, setScanResult] = useState(null);
  const [message, setMessage] = useState('Ready to Scan');
  const [pauseScanner, setPauseScanner] = useState(false); 
  
  // History State
  const [scanHistory, setScanHistory] = useState([]);

  // Manual Entry State
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [eventId]);

  const fetchHistory = async () => {
    try {
      const res = await getCheckedInAttendees(eventId);
      setScanHistory(res.data); // Populate list from DB
    } catch (err) {
      console.error("Failed to load history", err);
      toast.error("Could not load past scans");
    } finally {
      setLoadingHistory(false);
    }
  };

  /* ============================================================ */
  /* 1. HANDLE CAMERA SCAN                                        */
  /* ============================================================ */
  const handleScan = async (detectedCodes) => {
    const rawValue = detectedCodes?.[0]?.rawValue;

    if (!rawValue || status !== 'idle' || pauseScanner) return;

    try {
      setPauseScanner(true);
      // Camera scans are always type 'qr'
      await processTicket(rawValue, 'qr'); 
    } catch (err) {
      console.error("Scan Error", err);
      setPauseScanner(false);
    }
  };

  /* ============================================================ */
  /* 2. HANDLE MANUAL INPUT                                       */
  /* ============================================================ */
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    
    // 👇 2. PASS 'manual' FLAG
    await processTicket(manualCode.trim(), 'manual');
    
    setShowManualInput(false);
    setManualCode('');
  };

  /* ============================================================ */
  /* 3. PROCESS TICKET (ROUTING LOGIC)                            */
  /* ============================================================ */
  const processTicket = async (data, type = 'qr') => {
    try {
      setStatus('processing');
      setMessage('Verifying...');

      let res;
      
      // 👇 3. CHOOSE THE CORRECT API ENDPOINT
      if (type === 'manual') {
        // Send raw ID to /manual-checkin (Your perfect backend function)
        res = await checkInManually(data);
      } else {
        // Send JSON string to /scan
        res = await scanTicket(data);
      }

      // ✅ Success
      setStatus('success');
      setScanResult(res.data);
      
      const attendeeName = res.data.attendee?.name || 'Attendee';
      setMessage(`GRANTED: ${attendeeName}`);
      toast.success("Entry Granted!");

      setScanHistory(prev => [res.data, ...prev]);

    } catch (err) {
      console.error(err);
      
      if (err.response?.status === 409) {
        setStatus('duplicate');
        setMessage('ALREADY SCANNED!');
        toast.error("Duplicate Ticket!");
        
        if(err.response.data.data) {
             setScanResult(err.response.data.data);
        }
      } else {
        setStatus('error');
        setMessage('INVALID TICKET');
        toast.error(type === 'manual' ? "Ticket ID not found" : "Invalid QR Code");
      }
    } finally {
      setTimeout(resetScanner, 2500);
    }
  };

  const resetScanner = () => {
    setStatus('idle');
    setScanResult(null);
    setMessage('Ready to Scan');
    setPauseScanner(false);
  };

  const getBorderColor = () => {
    if (status === 'success') return 'border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.5)]';
    if (status === 'error') return 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)]';
    if (status === 'duplicate') return 'border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.5)]';
    return 'border-gray-600';
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 pb-20">
      
      {/* HEADER */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <Link to="/organizer/dashboard" className="p-2 bg-[#222] rounded-full hover:bg-[#333]">
            <ArrowLeft size={20} />
        </Link>
        <h2 className="font-bold text-lg">Event Entry</h2>
        <div className="w-10"></div>
      </div>

      {/* VIEWPORT */}
      <div className={`relative w-full max-w-md aspect-square bg-[#111] rounded-3xl overflow-hidden border-4 transition-all duration-300 ${getBorderColor()}`}>
        
        {status === 'idle' && !showManualInput && (
             <Scanner 
                onScan={handleScan} 
                allowMultiple={true}
                scanDelay={500}
                paused={pauseScanner}
                components={{ audio: false, finder: false }}
                styles={{ container: { width: '100%', height: '100%' }, video: { objectFit: 'cover' } }}
            />
        )}

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
                    <button type="submit" className="w-full bg-red-600 py-3 rounded-xl font-bold">Check In</button>
                    <button type="button" onClick={() => setShowManualInput(false)} className="w-full mt-3 py-2 text-gray-500 text-sm">Cancel</button>
                </form>
            </div>
        )}

        {status !== 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in z-30">
                {status === 'success' && <CheckCircle className="text-green-500 w-24 h-24 mb-4" />}
                {status === 'error' && <XCircle className="text-red-500 w-24 h-24 mb-4" />}
                {status === 'duplicate' && <AlertTriangle className="text-yellow-500 w-24 h-24 mb-4" />}
                <h3 className="text-2xl font-bold text-center px-4">{message}</h3>
                {scanResult && scanResult.type && <p className="mt-2 text-gray-400">{scanResult.type}</p>}
            </div>
        )}
      </div>

      <p className="mt-6 text-gray-500 text-sm">
        {showManualInput ? "Enter the alphanumeric ID below the QR code." : "Point camera at attendee's QR code"}
      </p>

      {!showManualInput && (
        <button onClick={() => setShowManualInput(true)} className="mt-6 flex items-center gap-2 px-6 py-3 bg-[#222] rounded-full hover:bg-[#333] transition">
            <Keyboard size={18} /> Enter Code Manually
        </button>
      )}

<div className="w-full max-w-md mt-10 border-t border-[#222] pt-6">
        <div className="flex items-center justify-between mb-4">
             <h3 className="text-gray-400 font-bold flex items-center gap-2">
                <Clock size={16} /> Live Feed ({scanHistory.length})
             </h3>
             <button onClick={fetchHistory} className="p-2 bg-[#222] rounded-full hover:bg-[#333]">
                <RefreshCw size={14} className={loadingHistory ? "animate-spin" : ""} />
             </button>
        </div>

        {loadingHistory ? (
            <div className="text-center p-8 text-gray-600 animate-pulse">Loading history...</div>
        ) : scanHistory.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-[#333] rounded-xl text-gray-600">
                No scans yet. Start scanning to see attendees!
            </div>
        ) : (
            <div className="space-y-3">
                {scanHistory.map((scan, index) => (
                    <div key={scan.ticketId || index} className="bg-[#1a1a1a] p-4 rounded-xl border border-[#333] flex items-center justify-between">
                        
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center shrink-0">
                                {scan.attendee?.image ? (
                                    <img src={scan.attendee.image} alt={scan.attendee.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} className="text-gray-400" />
                                )}
                            </div>
                            
                            <div>
                                <h4 className="font-bold text-white text-sm">{scan.attendee?.name || 'Unknown User'}</h4>
                                <p className="text-xs text-gray-400">{scan.attendee?.email}</p>
                            </div>
                        </div>

                        <div className="text-right">
                             <div className="flex items-center gap-1 text-green-500 text-xs font-bold uppercase mb-1 justify-end">
                                <CheckCircle size={12} /> Paid ₹{scan.amountPaid}
                             </div>
                             <p className="text-xs text-gray-500">
                                {new Date(scan.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </p>
                        </div>

                    </div>
                ))}
            </div>
        )}
      </div>

    </div>
  );
};

export default ScannerPage;