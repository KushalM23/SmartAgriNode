import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import './History.css';

export default function History() {
    const { session, user } = useAuth();
    const [history, setHistory] = useState({ crop_recommendations: [], weed_detections: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user || !session) return;

            try {
                setLoading(true);
                const token = session.access_token;

                // Use environment variable for API URL if available, otherwise default to localhost
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

                const response = await fetch(`${API_URL}/api/history?limit=5`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const data = await response.json();
                setHistory(data);
            } catch (err) {
                console.error("Failed to fetch history:", err);
                setError("Failed to load history data");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user, session]);

    if (!user) {
        return null;
    }

    if (loading) {
        return <div className="loading-state">Loading history...</div>;
    }

    if (error) {
        return <div className="error-state">{error}</div>;
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getConfidenceClass = (confidence) => {
        if (confidence >= 0.8) return 'confidence-high';
        if (confidence >= 0.5) return 'confidence-medium';
        return 'confidence-low';
    };

    return (
        <div className="history-container">
            <div className="history-card">
                <h3>Recent Crop Recommendations</h3>
                <div className="history-table-container">
                    {history.crop_recommendations && history.crop_recommendations.length > 0 ? (
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Crop</th>
                                    <th>Confidence</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.crop_recommendations.map((item, index) => (
                                    <tr key={item.id || index}>
                                        <td>{formatDate(item.created_at)}</td>
                                        <td>{item.recommended_crop}</td>
                                        <td>
                                            <span className={`confidence-badge ${getConfidenceClass(item.confidence)}`}>
                                                {(item.confidence * 100).toFixed(0)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">No crop recommendations yet</div>
                    )}
                </div>
            </div>

            <div className="history-card">
                <h3>Recent Weed Detections</h3>
                <div className="history-table-container">
                    {history.weed_detections && history.weed_detections.length > 0 ? (
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Image</th>
                                    <th>Detections</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.weed_detections.map((item, index) => (
                                    <tr key={item.id || index}>
                                        <td>{formatDate(item.created_at)}</td>
                                        <td title={item.image_filename}>
                                            {item.image_filename ?
                                                (item.image_filename.length > 15 ? item.image_filename.substring(0, 12) + '...' : item.image_filename)
                                                : 'Image'}
                                        </td>
                                        <td>{item.weed_count} weeds</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">No weed detections yet</div>
                    )}
                </div>
            </div>
        </div>
    );
}
