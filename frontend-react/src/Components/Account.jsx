import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { supabase } from '../supabaseClient';
import './Account.css';
import './History.css'; // Reuse some history styles
import logOutIcon from '../assets/log-out.png';
import moonIcon from '../assets/moon.png';
import sunIcon from '../assets/sun.png';

export default function Account() {
    const { user, session, signOut } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState({ crop_recommendations: [], weed_detections: [] });
    const [loading, setLoading] = useState(true);
    const [selectedRecommendation, setSelectedRecommendation] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showAvatarMenu, setShowAvatarMenu] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            fetchHistory();
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            // Try to fetch from public.users table first for most up-to-date data
            const { data, error } = await supabase
                .from('users')
                .select('avatar_url')
                .eq('user_id', user.id)
                .single();

            if (data && data.avatar_url) {
                setAvatarUrl(data.avatar_url);
            } else if (user.user_metadata?.avatar_url) {
                // Fallback to metadata if table fetch fails or is empty
                setAvatarUrl(user.user_metadata.avatar_url);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Fallback to metadata
            if (user.user_metadata?.avatar_url) {
                setAvatarUrl(user.user_metadata.avatar_url);
            }
        }
    };

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const token = session?.access_token;
            if (!token) return;

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            const response = await fetch(`${API_URL}/api/history?limit=20`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch history');

            const data = await response.json();
            setHistory(data);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const handleAvatarClick = () => {
        setShowAvatarMenu(true);
    };

    const handleFileSelect = () => {
        fileInputRef.current.click();
        setShowAvatarMenu(false);
    };

    const handleRemoveAvatar = async () => {
        try {
            if (!confirm('Are you sure you want to remove your profile picture?')) return;

            setUploading(true);
            
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = session?.access_token;

            const response = await fetch(`${API_URL}/api/delete-avatar`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to delete avatar');
            }

            setAvatarUrl(null);
            setShowAvatarMenu(false);
        } catch (error) {
            console.error('Error removing avatar:', error);
            alert('Error removing avatar.');
        } finally {
            setUploading(false);
        }
    };

    const uploadAvatar = async (event) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const formData = new FormData();
            formData.append('file', file);

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const token = session?.access_token;

            const response = await fetch(`${API_URL}/api/upload-avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to upload avatar');
            }

            const data = await response.json();
            setAvatarUrl(data.avatar_url);
            
            // Update local user metadata if needed, though the backend handles the DB update
            // We might want to refresh the session or user object if possible, 
            // but setting avatarUrl state is enough for immediate UI update.
            
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert(`Error uploading avatar: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const formatDate = (dateString) => {
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
        <div className="account-container">
            {/* Profile Section */}
            <div className="profile-section">
                <div className="user-info">
                    <div className="avatar-wrapper" onClick={handleAvatarClick}>
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Profile" className="avatar-image" />
                        ) : (
                            <div className="avatar-placeholder">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={uploadAvatar}
                            accept="image/*"
                            className="avatar-upload-input"
                            disabled={uploading}
                        />
                    </div>
                    <div className="username">
                        {user?.user_metadata?.username || user?.email?.split('@')[0]}
                    </div>
                </div>

                <div className="profile-actions">
                    <button className="icon-button" onClick={handleLogout}>
                        <img src={logOutIcon} alt="Logout" />
                    </button>
                </div>
            </div>

            {/* History Section */}
            <div className="history-section">
                {/* Crop History */}
                <div className="history-column">
                    <h3>Crop Recommendation History</h3>
                    <div className="history-table-container">
                        {history.crop_recommendations?.length > 0 ? (
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Crop</th>
                                        <th>Conf.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.crop_recommendations.map((item, index) => (
                                        <tr
                                            key={index}
                                            onClick={() => setSelectedRecommendation(item)}
                                            className="clickable-row"
                                        >
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
                            <div className="empty-state">No history available</div>
                        )}
                    </div>
                </div>

                {/* Weed History */}
                <div className="history-column">
                    <h3>Weed Detection History</h3>
                    <div className="history-table-container">
                        {history.weed_detections?.length > 0 ? (
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Image</th>
                                        <th>Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.weed_detections.map((item, index) => (
                                        <tr key={index}>
                                            <td>{formatDate(item.created_at)}</td>
                                            <td title={item.image_filename}>
                                                {item.image_filename?.length > 15
                                                    ? item.image_filename.substring(0, 12) + '...'
                                                    : item.image_filename || 'Image'}
                                            </td>
                                            <td>{item.weed_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-state">No history available</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for Recommendation Details */}
            {selectedRecommendation && (
                <div className="modal-overlay" onClick={() => setSelectedRecommendation(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedRecommendation(null)}>&times;</button>
                        <h2>Recommendation Details</h2>
                        <div className="modal-details">
                            <div className="detail-row">
                                <span className="detail-label">Date</span>
                                <span className="detail-value">{formatDate(selectedRecommendation.created_at)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Recommended Crop</span>
                                <span className="detail-value" style={{ fontWeight: 'bold', color: '#E01709' }}>
                                    {selectedRecommendation.recommended_crop}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Confidence</span>
                                <span className="detail-value">{(selectedRecommendation.confidence * 100).toFixed(1)}%</span>
                            </div>

                            <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Input Parameters</h4>
                            {selectedRecommendation.input_data && Object.entries(selectedRecommendation.input_data).map(([key, value]) => (
                                <div className="detail-row" key={key}>
                                    <span className="detail-label">{key}</span>
                                    <span className="detail-value">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Avatar Menu Modal */}
            {showAvatarMenu && (
                <div className="modal-overlay" onClick={() => setShowAvatarMenu(false)}>
                    <div className="modal-content avatar-menu" onClick={e => e.stopPropagation()}>
                        <h3>Profile Picture</h3>
                        <div className="avatar-menu-options">
                            <button onClick={handleFileSelect}>
                                {avatarUrl ? 'Change Image' : 'Upload Image'}
                            </button>
                            {avatarUrl && (
                                <button onClick={handleRemoveAvatar} className="danger-button">
                                    Remove Picture
                                </button>
                            )}
                            <button onClick={() => setShowAvatarMenu(false)} className="cancel-button">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
