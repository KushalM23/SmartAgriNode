import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { useTheme } from '../Context/ThemeContext';
import { supabase } from '../supabaseClient';
import { api } from '../lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import './Account.css';
import './History.css'; // Reuse some history styles
import './WeedDetection.css';
import logOutIcon from '../assets/log-out.png';
import moonIcon from '../assets/moon.png';
import sunIcon from '../assets/sun.png';

export default function Account() {
    const { user, session, signOut, refreshUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [history, setHistory] = useState({ crop_recommendations: [], weed_detections: [] });
    const [loading, setLoading] = useState(true);
    const [selectedRecommendation, setSelectedRecommendation] = useState(null);
    const [selectedWeedDetection, setSelectedWeedDetection] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showAvatarMenu, setShowAvatarMenu] = useState(false);
    const [showRemoveAlert, setShowRemoveAlert] = useState(false);
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

            const data = await api.history(token, 20);
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
            setUploading(true);
            const token = session?.access_token;
            
            await api.deleteAvatar(token);

            await refreshUser();
            setAvatarUrl(null);
            setShowAvatarMenu(false);
            setShowRemoveAlert(false);
        } catch (error) {
            console.error('Error removing avatar:', error);
            alert('Error removing avatar.');
        } finally {
            setUploading(false);
        }
    };

    const downloadImage = async (imageUrl, filename) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || 'image.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading image:', error);
        }
    };

    const uploadAvatar = async (event) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const token = session?.access_token;

            const data = await api.uploadAvatar(file, token);
            await refreshUser();
            setAvatarUrl(data.avatar_url);
            
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
                            <img 
                                src={avatarUrl} 
                                alt="Profile" 
                                className="avatar-image" 
                                crossOrigin="anonymous"
                            />
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
                    <button 
                        onClick={toggleTheme} 
                        className="icon-button theme-toggle-account"
                        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        style={{ marginRight: '10px' }}
                    >
                        {theme === 'light' ? (
                            <img src={moonIcon} alt="Dark Mode" style={{ width: '24px', height: '24px' }} />
                        ) : (
                            <img src={sunIcon} alt="Light Mode" style={{ width: '24px', height: '24px' }} />
                        )}
                    </button>
                    <button className="icon-button" onClick={handleLogout} title="Sign Out">
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
                                        <tr 
                                            key={index}
                                            onClick={() => setSelectedWeedDetection(item)}
                                            className="clickable-row"
                                        >
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

            {/* Modal for Weed Detection Details */}
            {selectedWeedDetection && (
                <div className="modal-overlay" onClick={() => setSelectedWeedDetection(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedWeedDetection(null)}>&times;</button>
                        <h2>Weed Detection Details</h2>
                        <div className="modal-body">
                            <div className="modal-images" style={{ flexDirection: 'column', gap: '20px' }}>
                                <div className="image-container" style={{ width: '100%' }}>
                                    <h4>Input Image</h4>
                                    {selectedWeedDetection.input_image_url ? (
                                        <img 
                                            src={selectedWeedDetection.input_image_url} 
                                            alt="Input" 
                                            className="history-image" 
                                            style={{ width: '80%', maxHeight: '300px', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <div className="empty-state">No input image available</div>
                                    )}
                                </div>
                                <div className="image-container" style={{ width: '100%' }}>
                                    <h4>Output Image</h4>
                                    {selectedWeedDetection.output_image_url ? (
                                        <div className="result-container" style={{ width: '100%' }}>
                                            <img 
                                                src={selectedWeedDetection.output_image_url} 
                                                alt="Output" 
                                                className="history-image preview-img" 
                                                style={{ width: '80%', maxHeight: '300px', objectFit: 'contain' }}
                                            />
                                            <div style={{ display: 'flex', gap: '10px', width: '80%', flexDirection: 'row' }}>
                                                <div className="weed-count" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}>
                                                    <strong>{selectedWeedDetection.weed_count || 0} weeds detected</strong>
                                                </div>
                                                <button 
                                                    onClick={() => downloadImage(selectedWeedDetection.output_image_url, selectedWeedDetection.image_filename || 'weed-detection.jpg')}
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
                                    ) : (
                                        <div className="empty-state">No output image available</div>
                                    )}
                                </div>
                            </div>
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
                                <AlertDialog open={showRemoveAlert} onOpenChange={setShowRemoveAlert}>
                                    <AlertDialogTrigger asChild>
                                        <button className="danger-button">
                                            Remove Picture
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Remove Profile Picture</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to remove your profile picture? This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleRemoveAvatar} className="bg-red-600 hover:bg-red-700">
                                                Remove
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
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
