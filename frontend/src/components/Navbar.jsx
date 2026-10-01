import axios from 'axios';
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { MdOutlineAccountCircle, MdNotifications, MdCheck, MdClose } from "react-icons/md";

import ErrorMsg from './utils/ErrorMsg.jsx';
import logo from '../assets/fullLogo.webp';
import '../styles/Navbar.css';
import '../styles/DropDown.css';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [userName, setUserName] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [errorMessage, setErrorMessage] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    
    const dropdownRef = useRef(null);
    const notificationRef = useRef(null);
    const navigate = useNavigate();
    const API_URL = "http://localhost:8000/api";

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return token ? { headers: { Authorization: `Bearer ${token}` } } : null;
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsOpen(false);
        navigate('/', { replace: true });
    };

    const fetchUserAvatar = async () => {
        const config = getAuthHeaders();
        if (!config) return;

        try {
            const response = await axios.get(`${API_URL}/users/me`, config);
            setAvatarUrl(response.data.avatar_url || '');
            
            const name = response.data.first_name || response.data.username || response.data.name || '';
            setUserName(name);
        } catch (error) {
            console.error("Navbar failed to fetch user avatar", error);
        }
    };

    const fetchNotifications = async () => {
        const config = getAuthHeaders();
        if (!config) return;

        try {
            const response = await axios.get(`${API_URL}/notifications`, config);
            const data = response.data || [];
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchUserAvatar();
        fetchNotifications();

        const interval = setInterval(fetchNotifications, 30000);

        const handleAvatarEvent = () => fetchUserAvatar();
        window.addEventListener('avatarUpdated', handleAvatarEvent);

        return () => {
            clearInterval(interval);
            window.removeEventListener('avatarUpdated', handleAvatarEvent);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (notificationId) => {
        const config = getAuthHeaders();
        if (!config) return;

        try {
            await axios.patch(`${API_URL}/notifications/${notificationId}/read`, {}, config);
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const markAllAsRead = async () => {
        const config = getAuthHeaders();
        if (!config || unreadCount === 0) return;

        try {
            await axios.patch(`${API_URL}/notifications/read-all`, {}, config);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all notifications as read", error);
        }
    };

    const handleRespondJoinRequest = async (notification, accept) => {
        const config = getAuthHeaders();
        if (!config) return;

        try {
            await axios.post(
                `${API_URL}/projects/join-requests/${notification.reference_id}/respond`,
                { accept },
                config
            );
            markAsRead(notification.id);
        } catch (error) {
            console.error("Failed to respond to join request", error);
            const msg = error.response?.data?.detail || "Failed to respond to join request";
            setErrorMessage({ 
                text: msg, 
                type: 'error', 
                id: `err-${notification.id}-${error.response?.status || 'network'}` 
            });
        }
    };

    return (
        <nav>
            <ErrorMsg key={errorMessage?.id} message={errorMessage} />
            <Link to={'/dashboard'} className="navEl">
                <img src={logo} alt='Logo' />
            </Link>

            <div className="navRightSection">
                <div className="notificationContainer" ref={notificationRef}>
                    <div 
                        className="notificationIconWrapper" 
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    >
                        <MdNotifications className="navElIcon" size={'2.2rem'} color={'#8B949E'} />
                        {unreadCount > 0 && <span className="notificationBadge">{unreadCount}</span>}
                    </div>

                    {isNotificationsOpen && (
                        <div className="notificationDropdown">
                            <div className="notificationHeader">
                                <h3>Notifications</h3>
                                {unreadCount > 0 && (
                                    <button 
                                        className="markAllReadBtn"
                                        onClick={markAllAsRead}
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>

                            <div className="notificationList">
                                {notifications.length === 0 ? (
                                    <div className="emptyNotifications">No new notifications</div>
                                ) : (
                                    notifications.map((n) => (
                                        <div 
                                            key={n.id} 
                                            className={`notificationItem ${!n.is_read ? 'unread' : ''}`}
                                            onClick={() => !n.is_read && markAsRead(n.id)}
                                        >
                                            <div className="notificationContent">
                                                <p className="notificationMessage">{n.message}</p>
                                                <span className="notificationTime">
                                                    {new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            {n.type === 'JOIN_REQUEST' && !n.is_read && (
                                                <div className="notificationActions" onClick={(e) => e.stopPropagation()}>
                                                    <button 
                                                        className="btnAccept" 
                                                        title="Accept"
                                                        onClick={() => handleRespondJoinRequest(n, true)}
                                                    >
                                                        <MdCheck size={18} />
                                                    </button>
                                                    <button 
                                                        className="btnReject" 
                                                        title="Reject"
                                                        onClick={() => handleRespondJoinRequest(n, false)}
                                                    >
                                                        <MdClose size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {userName && <span className="userGreeting">Hi, {userName}</span>}

                <div className="dropdown" ref={dropdownRef}>
                    {avatarUrl ? (
                        <img 
                            src={avatarUrl} 
                            alt="Account" 
                            className="navAvatar"
                            onClick={() => setIsOpen(!isOpen)} 
                        />
                    ) : (
                        <MdOutlineAccountCircle 
                            onClick={() => setIsOpen(!isOpen)} 
                            size={'3rem'} 
                            color={'#8B949E'} 
                            className="navElIcon"
                        />
                    )}

                    {isOpen && (
                        <ul className="dropdownElementsContainer">
                            <li key={1} onClick={() => { setIsOpen(false); navigate('/account'); }}>Account</li>
                            <li key={2} onClick={() => { setIsOpen(false); navigate('/settings'); }}>Settings</li>
                            <li key={3} onClick={handleLogout}>Logout</li>
                        </ul>
                    )}
                </div>
            </div>
        </nav>
    );
}