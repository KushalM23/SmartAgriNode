import React, { useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../lib/api';

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
    <div className="w-full p-8 bg-[#f8f9fa]">
      <h1 className="text-[#333] text-[2rem] font-semibold mb-6 tracking-tighter text-center">Weed Detection</h1>
      <div className="flex flex-col items-center gap-4">
        <div className="bg-white p-8 rounded-[10px] shadow-[0_2px_4px_rgba(0,0,0,0.1)] w-full max-w-[720px] mx-auto md:p-5">
          <div className="border-2 border-dashed border-[#ddd] rounded-[10px] p-12 text-center cursor-pointer transition-colors duration-200 hover:border-[#E01709]">
            <div className="text-[#E01709] mb-4 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="mb-2 text-[#333]">Choose a clear image of your field</p>
            <p className="text-[#888] my-2">or</p>
            <button className="bg-[#E01709] text-white border-none py-3 px-8 rounded-[5px] text-base cursor-pointer transition-opacity duration-200 hover:opacity-90" onClick={onBrowse}>Browse Files</button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileSelected} />
          </div>
          {(selectedFile || result) && (
            <div className="mt-4 flex flex-col gap-3">
              {!result && selectedFile && (
                <img src={URL.createObjectURL(selectedFile)} alt="preview" className="w-full rounded-[10px] border border-[#eee]" />
              )}
              {result && result.result_image && (
                <div className="flex flex-col items-center gap-4">
                  <img src={`data:image/jpeg;base64,${result.result_image}`} alt="Weed result" className="w-full rounded-[10px] border border-[#eee]" />
                  <div className="bg-[#E01709] text-white py-3 px-6 rounded-lg text-[1.1rem] text-center shadow-[0_2px_4px_rgba(224,23,9,0.3)]">
                    <strong>{result.detections || 0} weeds detected</strong>
                  </div>
                </div>
              )}
              {!result && (
                <button className="bg-[#E01709] text-white border-none py-3 px-8 rounded-[5px] text-base cursor-pointer transition-opacity duration-200 hover:opacity-90 disabled:opacity-70" onClick={onDetect} disabled={loading || !selectedFile}>{loading ? 'Detecting...' : 'Detect Weeds'}</button>
              )}
            </div>
          )}
          {error && <div className="text-[#dc3545] bg-[#f8d7da] border border-[#f5c6cb] rounded p-3 mt-3 text-sm">{error}</div>}
        </div>
        {/* Guidelines removed per request */}
      </div>
    </div>
  );
}