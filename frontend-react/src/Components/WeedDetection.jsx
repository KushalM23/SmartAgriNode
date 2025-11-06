import React, { useRef, useState } from 'react';
import { useAuth } from '../lib/clerk';
import { api } from '../lib/api';
import './WeedDetection.css';

export default function WeedDetection() {
  const { getToken } = useAuth();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
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
    if (!selectedFile) { setError('Choose an image first'); return; }
    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      const res = await api.weedDetection(selectedFile, token);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Detection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Weed Detection</h1>
      <div className="detection-content">
        <div className="upload-section">
          <div className="upload-box">
            <div className="upload-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
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
                  <div className="weed-count">
                    <strong>{result.detections || 0} weeds detected</strong>
                  </div>
                </div>
              )}
              {!result && (
                <button className="browse-button" onClick={onDetect} disabled={loading || !selectedFile}>{loading ? 'Detecting...' : 'Detect Weeds'}</button>
              )}
            </div>
          )}
          {error && <div className="auth-error" style={{marginTop: '12px'}}>{error}</div>}
        </div>
        {/* Guidelines removed per request */}
      </div>
    </div>
  );;
}