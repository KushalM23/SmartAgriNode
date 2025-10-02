import React, { useState } from 'react';
import { api } from '../lib/api';
import './CropRecommendation.css';

export default function CropRecommendation() {
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
      const payload = {
        N: parseFloat(formData.N),
        P: parseFloat(formData.P),
        K: parseFloat(formData.K),
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        ph: parseFloat(formData.ph),
        rainfall: parseFloat(formData.rainfall)
      };
      const res = await api.cropRecommendation(payload);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Crop Recommendation</h1>
      <div className="recommendation-content">
        <div className="recommendation-form">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nitrogen (N)</label>
                <input
                  type="number"
                  name="N"
                  value={formData.N}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter nitrogen content"
                  min="0"
                  max="200"
                  step="0.1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phosphorous (P)</label>
                <input
                  type="number"
                  name="P"
                  value={formData.P}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter phosphorous content"
                  min="0"
                  max="150"
                  step="0.1"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Potassium (K)</label>
                <input
                  type="number"
                  name="K"
                  value={formData.K}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter potassium content"
                  min="0"
                  max="200"
                  step="0.1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Temperature (°C)</label>
                <input
                  type="number"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter temperature"
                  step="0.1"
                  min="5"
                  max="40"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Humidity (%)</label>
                <input
                  type="number"
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter humidity"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>

              <div className="form-group">
                <label>pH Level</label>
                <input
                  type="number"
                  name="ph"
                  value={formData.ph}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter pH level"
                  step="0.1"
                  min="4"
                  max="10"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Rainfall (mm)</label>
                <input
                  type="number"
                  name="rainfall"
                  value={formData.rainfall}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter rainfall"
                  min="20"
                  max="5000"
                  step="0.1"
                  required
                />
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}
            <button type="submit" className="submit-button" disabled={loading}>{loading ? 'Getting...' : 'Get Recommendations'}</button>
          </form>
        </div>

        {result && (
          <div className="result-card">
            <div className="result-header">
              <h3 className="result-title">Recommendation</h3>
            </div>
            <div className="result-highlight">
              {result.recommended_crop}
            </div>
            <div className="result-row">
              <span className="label">Confidence</span>
              <span className="value">{(result.confidence * 100).toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}