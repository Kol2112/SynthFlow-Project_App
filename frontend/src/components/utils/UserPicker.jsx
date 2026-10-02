import { useState, useEffect, useRef } from 'react';
import { IoPersonAdd } from 'react-icons/io5';
import { userService } from './api.js';
import RenderAvatars from './RenderAvatars.jsx';
import ErrorMsg from './ErrorMsg.jsx';
import '../../styles/UserPicker.css';

export default function UserPicker({ 
    members = [], 
    onAddMember, 
    onRemoveMember, 
    label = "Add members",
    projectMembersList = null
}) {
    const [isInputOpen, setIsInputOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [foundUser, setFoundUser] = useState(null);
    const [notification, setNotification] = useState(null);

    const debounceTimerRef = useRef(null);

    const performSearch = async (val) => {
        const query = val.trim();
        
        if (!query || query.length < 2) {
            setFoundUser(null);
            setNotification(null);
            return;
        }

        if (projectMembersList) {
            const match = projectMembersList.find(m => m.email.toLowerCase().includes(query.toLowerCase()));
            setFoundUser(match || null);
            setNotification(null);
            return;
        }

        try {
            const data = await userService.searchUsers(query);
            setFoundUser(data);
            setNotification(null);
        } catch (err) {
            setFoundUser(null);
            setNotification(null);
        }
    };

    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            performSearch(email);
        }, 300);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [email]);

    const handleInputChange = (val) => {
        setEmail(val);
        setNotification(null);
    };

    const handleConfirmAdd = () => {
        if (!foundUser) return;
        const alreadyAdded = members.some(m => m.email.toLowerCase() === foundUser.email.toLowerCase());
        if (alreadyAdded) {
            setNotification({ text: 'User is already added.', type: 'error', id: Date.now() });
            return;
        }

        onAddMember(foundUser);
        setEmail('');
        setFoundUser(null);
        setIsInputOpen(false);
    };

    const toggleInput = () => {
        if (isInputOpen) {
            setEmail('');
            setFoundUser(null);
            setNotification(null);
        }
        setIsInputOpen(!isInputOpen);
    };

    return (
        <div className="userPickerContainer">
            <ErrorMsg key={notification?.id} message={notification} />
            <label className="userPickerLabel">{label}</label>
            
            <div className="userPickerRow">
                <button 
                    type="button" 
                    className={`addMemberBtn ${isInputOpen ? 'active' : ''}`}
                    onClick={toggleInput}
                    title={isInputOpen ? "Cancel" : "Add user"}
                >
                    <IoPersonAdd size={18} />
                </button>

                <div className="pickerContentWrapper">
                    {!isInputOpen && (
                        <div className="avatarsListWrapper">
                            <RenderAvatars 
                                members={members} 
                                maxCount={6} 
                                onRemoveMember={onRemoveMember} 
                            />
                        </div>
                    )}

                    {isInputOpen && (
                        <div className="userSearchSlide open">
                            <input 
                                type="text" 
                                placeholder="Enter user email..." 
                                value={email}
                                onChange={(e) => handleInputChange(e.target.value)}
                                className="userSearchInput"
                                autoFocus
                            />
                        </div>
                    )}
                </div>
            </div>

            {isInputOpen && foundUser && (
                <div className="searchResultsContainer">
                    <div className="foundUserBadge" onClick={handleConfirmAdd}>
                        <div className="badgeAvatar">
                            {foundUser.avatar_url ? (
                                <img src={foundUser.avatar_url} alt={foundUser.name || foundUser.email} />
                            ) : (
                                <div className="badgeAvatarFallback">
                                    {(foundUser.name ? foundUser.name[0] : foundUser.email[0]).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="badgeUserInfo">
                            <span className="userName">
                                {(foundUser.name || foundUser.surname) 
                                    ? `${foundUser.name || ''} ${foundUser.surname || ''}`.trim() 
                                    : 'No Name'}
                            </span>
                            <span className="userEmail">{foundUser.email}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}