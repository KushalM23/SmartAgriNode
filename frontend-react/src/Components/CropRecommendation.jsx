import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { api } from '../lib/api';

export default function CropRecommendation() {
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = await getToken();
      const payload = {
        N: parseFloat(formData.N),
        P: parseFloat(formData.P),
        K: parseFloat(formData.K),
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        ph: parseFloat(formData.ph),
        rainfall: parseFloat(formData.rainfall)
      };
      const res = await api.cropRecommendation(payload, token);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-8 bg-[#f8f9fa]">
      <h1 className="text-[#333] text-[2rem] font-semibold mb-6 tracking-tighter text-center">Crop Recommendation</h1>
      <div className="flex flex-col items-center w-full max-w-[820px] mx-auto">
        <div className="bg-white p-8 rounded-[10px] shadow-[0_2px_4px_rgba(0,0,0,0.1)] w-full">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="flex-1">
                <label className="block mb-2 text-[#555] font-medium">Nitrogen (N)</label>
                <input
                  type="number"
                  name="N"
                  value={formData.N}
                  onChange={handleChange}
                  className="w-full p-3 border border-[#ddd] rounded-[5px] text-base transition-colors duration-200 focus:outline-none focus:border-[#E01709]"
                  placeholder="Enter nitrogen content"
                  min="0"
                  max="200"
                  step="0.1"
                  required
                />
              </div>

              <div className="flex-1">
                <label className="block mb-2 text-[#555] font-medium">Phosphorous (P)</label>
                <input
                  type="number"
                  name="P"
                  value={formData.P}
                  onChange={handleChange}
                  className="w-full p-3 border border-[#ddd] rounded-[5px] text-base transition-colors duration-200 focus:outline-none focus:border-[#E01709]"
                  placeholder="Enter phosphorous content"
                  min="0"
                  max="150"
                  step="0.1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="flex-1">
                <label className="block mb-2 text-[#555] font-medium">Potassium (K)</label>
                <input
                  type="number"
                  name="K"
                  value={formData.K}
                  onChange={handleChange}
                  className="w-full p-3 border border-[#ddd] rounded-[5px] text-base transition-colors duration-200 focus:outline-none focus:border-[#E01709]"
                  placeholder="Enter potassium content"
                  min="0"
                  max="200"
                  step="0.1"
                  required
                />
              </div>

              <div className="flex-1">
                <label className="block mb-2 text-[#555] font-medium">Temperature (°C)</label>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  className="w-full p-3 border border-[#ddd] rounded-[5px] text-base transition-colors duration-200 focus:outline-none focus:border-[#E01709]"
                  placeholder="Enter temperature"
                  step="0.1"
                  min="5"
                  max="40"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="flex-1">
                <label className="block mb-2 text-[#555] font-medium">Humidity (%)</label>
                <input
                  type="number"
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleChange}
                  className="w-full p-3 border border-[#ddd] rounded-[5px] text-base transition-colors duration-200 focus:outline-none focus:border-[#E01709]"
                  placeholder="Enter humidity"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>

              <div className="flex-1">
                <label className="block mb-2 text-[#555] font-medium">pH Level</label>
                <input
                  type="number"
                  name="ph"
                  value={formData.ph}
                  onChange={handleChange}
                  className="w-full p-3 border border-[#ddd] rounded-[5px] text-base transition-colors duration-200 focus:outline-none focus:border-[#E01709]"
                  placeholder="Enter pH level"
                  step="0.1"
                  min="4"
                  max="10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="flex-1">
                <label className="block mb-2 text-[#555] font-medium">Rainfall (mm)</label>
                <input
                  type="number"
                  name="rainfall"
                  value={formData.rainfall}
                  onChange={handleChange}
                  className="w-full p-3 border border-[#ddd] rounded-[5px] text-base transition-colors duration-200 focus:outline-none focus:border-[#E01709]"
                  placeholder="Enter rainfall"
                  min="20"
                  max="5000"
                  step="0.1"
                  required
                />
              </div>
            </div>

            {error && <div className="text-[#dc3545] bg-[#f8d7da] border border-[#f5c6cb] rounded p-3 mb-4 text-sm">{error}</div>}
            <button type="submit" className="bg-[#E01709] text-white border-none py-4 px-8 rounded-[5px] text-base cursor-pointer w-full transition-opacity duration-200 hover:opacity-90 disabled:opacity-70" disabled={loading}>{loading ? 'Getting...' : 'Get Recommendations'}</button>
          </form>
        </div>

        {result && (
          <div className="bg-white p-5 rounded-[10px] shadow-[0_2px_4px_rgba(0,0,0,0.1)] mt-4 text-left w-full">
            <div className="flex justify-between items-center mb-2">
              <h3 className="m-0 text-[#333] font-semibold text-lg">Recommendation</h3>
            </div>
            <div className="bg-[#E01709] text-white rounded-lg py-4 px-5 text-2xl font-bold text-left mb-3 block w-full box-border">
              {result.recommended_crop}
            </div>
            <div className="flex justify-between py-2 border-t border-dashed border-[#eee]">
              <span className="text-[#555]">Confidence</span>
              <span className="text-[#E01709] font-semibold text-[1.1rem]">{(result.confidence * 100).toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}