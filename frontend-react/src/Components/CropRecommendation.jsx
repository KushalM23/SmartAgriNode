import React, { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { api } from '../lib/api';
import './CropRecommendation.css';

export default function CropRecommendation() {
  const { session } = useAuth();
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
  const [showModal, setShowModal] = useState(false);
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
    if (!session) { setError('Please log in to use this feature'); return; }

    setError('');
    setLoading(true);
    try {
      const token = session?.access_token;
      if (!token) throw new Error('Authentication token missing');

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
      setShowModal(true);
    } catch (err) {
      console.error("Crop recommendation error:", err);
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
            </div>

            <div className="form-row">
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

        {showModal && result && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Recommendation</h2>
                <button className="close-button" onClick={() => setShowModal(false)}>&times;</button>
              </div>

              <div className="modal-body simple-result">
                <p className="result-label">We recommend growing</p>
                <h2 className="result-crop">{result.recommended_crop}</h2>
                <p className="result-confidence">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
              </div>

              <div className="modal-footer">
                <button className="done-button" onClick={() => setShowModal(false)}>Done</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}