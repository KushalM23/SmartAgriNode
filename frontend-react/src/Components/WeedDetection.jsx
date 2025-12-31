import React, { useRef, useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { api } from '../lib/api';
import './WeedDetection.css';

export default function WeedDetection() {
  const { session } = useAuth();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [scanResults, setScanResults] = useState([]); // For camera mode
  const [mode, setMode] = useState('upload'); // 'upload' | 'camera'
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onBrowse = () => fileInputRef.current?.click();
  const onFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Max 10MB'); return; }
    setError('');
    setSelectedFile(file);
    setResult(null);
  };

  const onDetect = async () => {
    if (!session) { setError('Please log in to use this feature'); return; }
    if (!selectedFile) { setError('Choose an image first'); return; }
    setLoading(true);
    setError('');
    try {
      const token = session?.access_token;
      if (!token) throw new Error('Authentication token missing');

      const res = await api.weedDetection(selectedFile, token);
      setResult(res);
    } catch (err) {
      console.error("Weed detection error:", err);
      setError(err.message || 'Detection failed');
    } finally {
      setLoading(false);
    }
  };

  const startCameraScan = async () => {
    if (!session) { setError('Please log in to use camera'); return; }
    setScanning(true);
    setScanResults([]);
    setError('');
    try {
      const token = session.access_token;
      await api.triggerWeedScan(token);
      
      // Poll for results
      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const res = await api.getWeedScanResults(token);
          if (res.results && res.results.length > 0) {
            setScanResults(res.results);
            // If we have 8 images, stop polling
            if (res.results.length >= 8) {
              clearInterval(pollInterval);
              setScanning(false);
            }
          }
          
          if (attempts > 60) { // 2 minutes timeout
            clearInterval(pollInterval);
            setScanning(false);
            if (scanResults.length === 0) setError('Scan timeout. No images received.');
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 2000);
    } catch (err) {
      console.error("Scan trigger error:", err);
      setError('Failed to start scan');
      setScanning(false);
    }
  };

  const downloadImage = async (imageUrl, filename) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'weed-detection-result.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <div className="page-container">
      <h1>Weed Detection</h1>
      
      <div className="tabs" style={{ margin: '0 auto 2rem auto', maxWidth: '400px' }}>
        <button 
          className={`tab ${mode === 'upload' ? 'active' : ''}`}
          onClick={() => setMode('upload')}
        >
          Upload Image
        </button>
        <button 
          className={`tab ${mode === 'camera' ? 'active' : ''}`}
          onClick={() => setMode('camera')}
        >
          Node Camera Scan
        </button>
      </div>

      <div className="detection-content">
        {mode === 'upload' ? (
          <div className="upload-section">
            <div className="upload-row">
              <div className="upload-box">
                <div className="upload-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="upload-text">Choose a clear image of your field</p>
                <p className="upload-or">or</p>
                <button className="browse-button" onClick={onBrowse}>Browse Files</button>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileSelected} />
              </div>
              {(selectedFile || result) && (
                <div className="preview-card">
                  {!result && selectedFile && (
                    <img src={URL.createObjectURL(selectedFile)} alt="preview" className="preview-img" />
                  )}
                  {result && result.result_image && (
                    <div className="result-container">
                      <img src={`data:image/jpeg;base64,${result.result_image}`} alt="Weed result" className="preview-img" />
                      <div style={{ display: 'flex', gap: '10px', width: '100%', flexDirection: 'row' }}>
                        <div className="weed-count" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}>
                          <strong>{result.detections || 0} weeds detected</strong>
                        </div>
                        <button 
                          onClick={() => downloadImage(`data:image/jpeg;base64,${result.result_image}`, 'weed-detection.jpg')}
                          className="browse-button"
                          title="Download Result"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                  {!result && (
                    <button className="browse-button" onClick={onDetect} disabled={loading || !selectedFile}>{loading ? 'Detecting...' : 'Detect Weeds'}</button>
                  )}
                </div>
              )}
            </div>
            {error && <div className="auth-error" style={{ marginTop: '12px' }}>{error}</div>}
          </div>
        ) : (
          <div className="camera-section" style={{ width: '100%', textAlign: 'center' }}>
            <button 
              onClick={startCameraScan} 
              disabled={scanning}
              className="submit-button"
              style={{ maxWidth: '300px', marginBottom: '20px', fontSize: '1rem', padding: '1rem 2rem' }}
            >
              {scanning ? 'Scanning (Rotating & Capturing)...' : 'Start 360° Camera Scan'}
            </button>
            
            {error && <div className="auth-error" style={{ marginBottom: '20px' }}>{error}</div>}

            <div className="scan-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
              {/* We want a 3x3 grid. The center (index 4) is the node vector. */}
              {/* We map the scanResults (up to 8 images) around it. */}
              {/* Indices 0-3 go before, Index 4 is node, Indices 4-7 go after. */}
              
              {(() => {
                const gridItems = [];
                const results = [...scanResults]; // Copy
                
                // Fill up to 8 items if we have fewer (for layout stability) or just use what we have
                // But user wants a 3x3 grid specifically.
                
                for (let i = 0; i < 9; i++) {
                  if (i === 4) {
                    // Center Item: Node Vector
                    gridItems.push(
                      <div key="center-node" className="scan-card" style={{ 
                        background: 'var(--card-bg)', 
                        padding: '10px', 
                        borderRadius: '10px', 
                        border: '2px solid var(--primary-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '200px'
                      }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '64px', height: '64px', color: 'var(--primary-color)', marginBottom: '10px' }}>
                          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                          <line x1="6" y1="6" x2="6.01" y2="6"></line>
                          <line x1="6" y1="18" x2="6.01" y2="18"></line>
                        </svg>
                        <span style={{ color: 'var(--heading-color)', fontWeight: '600' }}>SmartAgri Node</span>
                        <span style={{ color: 'var(--text-color)', fontSize: '0.8rem' }}>Active</span>
                      </div>
                    );
                  } else {
                    // Get next result
                    const resIndex = i < 4 ? i : i - 1;
                    const res = results[resIndex];
                    
                    if (res) {
                      gridItems.push(
                        <div key={i} className="scan-card" style={{ background: 'var(--card-bg)', padding: '10px', borderRadius: '10px', border: '1px solid var(--input-border)' }}>
                          <img src={`data:image/jpeg;base64,${res.image}`} alt={`Scan ${resIndex+1}`} style={{ width: '100%', borderRadius: '8px', marginBottom: '10px', aspectRatio: '4/3', objectFit: 'cover' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-color)' }}>View {resIndex + 1}</span>
                            <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{res.weed_count} Weeds</span>
                          </div>
                        </div>
                      );
                    } else {
                      // Placeholder if no image yet
                      gridItems.push(
                        <div key={i} className="scan-card" style={{ 
                          background: 'var(--input-bg)', 
                          padding: '10px', 
                          borderRadius: '10px', 
                          border: '1px dashed var(--input-border)',
                          minHeight: '200px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ color: 'var(--text-color)', opacity: 0.5 }}>Waiting...</span>
                        </div>
                      );
                    }
                  }
                }
                return gridItems;
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}