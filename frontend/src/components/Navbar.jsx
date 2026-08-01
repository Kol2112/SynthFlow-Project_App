import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { MdOutlineAccountCircle } from "react-icons/md";
import logo from '../assets/fullLogo.webp';

import '../styles/Navbar.css';

export default function Navbar(){
    const [isOpen, setIsOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsOpen(false);
        navigate('/', {replace: true});
    };

    const fetchUserAvatar = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const response = await fetch("http://localhost:8000/api/users/me", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAvatarUrl(data.avatar_url || '');
            }
        } catch (error) {
            console.error("Navbar failed to fetch user avatar", error);
        }
    };

    useEffect(() => {
        fetchUserAvatar();

        const handleAvatarEvent = () => {
            fetchUserAvatar();
        };

        window.addEventListener('avatarUpdated', handleAvatarEvent);
        return () => window.removeEventListener('avatarUpdated', handleAvatarEvent);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav>
            <Link to={'/dashboard'} className="navEl"><img src={logo} alt='Logo'></img></Link>
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
        </nav>
    );
}