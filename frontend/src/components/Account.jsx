import { MdOutlineAccountCircle } from "react-icons/md";
import '../styles/Account.css';
import { useEffect, useRef, useState } from "react";
import ErrorMsg from "./utils/ErrorMsg.jsx";
import ConfirmationModal from "./utils/ConfirmationModal.jsx";

export default function Account(){
    const [avatarUrl, setAvatarUrl] = useState('');
    const [currentEmail, setCurrentEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    const [newEmail, setNewEmail] = useState('');
    const [emailPassword, setEmailPassword] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Główny stan komunikatów
    const [notification, setNotification] = useState(null);

    // Stan dla uniwersalnego ConfirmationModal
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        submitLabel: "Confirm",
        isDanger: false,
        onConfirm: () => {}
    });

    const closeModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    useEffect(()=>{
        const fetchUserData = async() =>{
            try{
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:8000/api/users/me", {
                    headers: {"Authorization": `Bearer ${token}`}
                });
                if(response.ok){
                    const data = await response.json();
                    if(data.avatar_url){
                        setAvatarUrl(data.avatar_url);
                    }
                    if(data.email){
                        setCurrentEmail(data.email);
                    }
                }
            } catch(error){
                console.error("Failed to fetch user data", error);
            }
        };
        fetchUserData();
    }, []);

    const triggerFileInput = () =>{
        if(fileInputRef.current){
            fileInputRef.current.click();
        }
    };

    const handleAvatarChange = async(e) =>{
        const file = e.target.files[0];
        if(!file) return;

        if(file.size > 2 * 1024 * 1024){
            setNotification({ text: "File size should not exceed 2MB", type: "error" });
            return;
        }
        
        const reader = new FileReader();
        reader.onloadend = async() =>{
            const base64Image = reader.result;
            setIsLoading(true);

            try{
                const token = localStorage.getItem("token");
                const response = await fetch("http://localhost:8000/api/users/me/avatar",{
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({avatar_url: base64Image})
                });
                if(response.ok){
                    setAvatarUrl(base64Image);
                    window.dispatchEvent(new Event("avatarUpdated"));
                    setNotification({ text: "Avatar updated successfully!", type: "success" });
                }else{
                    setNotification({ text: "Failed to update avatar", type: "error" });
                }
            }catch(error){
                setNotification({ text: "Error uploading avatar", type: "error" });
            } finally{
                setIsLoading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    // --- USUWANIE AVATARA ---
    const executeDeleteAvatar = async () => {
        closeModal();
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8000/api/users/me/avatar", {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                setAvatarUrl('');
                window.dispatchEvent(new Event("avatarUpdated"));
                setNotification({ text: "Avatar deleted successfully!", type: "success" });
            }
        } catch (error) {
            setNotification({ text: "Error deleting avatar", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReqDeleteAvatar = () => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Avatar",
            message: "Are you sure you want to delete your profile picture?",
            submitLabel: "Delete Avatar",
            isDanger: true,
            onConfirm: executeDeleteAvatar
        });
    };

    // --- ZMIANA EMAILA ---
    const handleEmailChange = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8000/api/users/me/request-email-change", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ new_email: newEmail, password: emailPassword })
            });

            const data = await response.json();
            if (response.ok) {
                setNewEmail('');
                setEmailPassword('');
                setNotification({ text: data.message, type: 'success' });
            } else {
                setNotification({ text: data.detail || "Failed to request email change.", type: 'error' });
            }
        } catch (error) {
            setNotification({ text: "Connection error.", type: 'error' });
        }
    };

    // --- ZMIANA HASŁA ---
    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setNotification({ text: "New passwords do not match!", type: 'error' });
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8000/api/users/me/request-password-change", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
            });

            const data = await response.json();
            if (response.ok) {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setNotification({ text: data.message, type: 'success' });
            } else {
                setNotification({ text: data.detail || "Failed to request password change.", type: 'error' });
            }
        } catch (error) {
            setNotification({ text: "Connection error.", type: 'error' });
        }
    };

    // --- USUWANIE KONTA ---
    const executeDeleteAccount = async () => {
        closeModal();
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8000/api/users/me", {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                localStorage.removeItem("token");
                window.location.href = "/login";
            } else {
                const data = await response.json();
                setNotification({ text: data.detail || "Failed to delete account.", type: 'error' });
            }
        } catch (error) {
            setNotification({ text: "Connection error.", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReqDeleteAccount = () => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Account",
            message: (
                <>
                    Are you sure you want to delete your account?
                    <br />
                    This action cannot be undone and all your data will be permanently removed!
                </>
            ),
            submitLabel: "Delete Account",
            isDanger: true,
            onConfirm: executeDeleteAccount
        });
    };

    return(
        <div className="accountContainer">
            {/* Komponent powiadomień */}
            <ErrorMsg message={notification} />

            {/* Uniwersalny Modal Potwierdzający */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={closeModal}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                submitLabel={confirmModal.submitLabel}
                isDanger={confirmModal.isDanger}
            />

            <h1 className="accountTitle">Account Settings</h1>
            
            <section className="accountSection">
                <h2 className="sectionTitle">Profile Avatar</h2>
                <div className="avatarUploadGroup">
                    <div className={`avatarPreview ${isLoading ? 'loading' : ""}`} onClick={triggerFileInput} title="Click to change avatar">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="User Avatar" className="avatarImage" />
                        ) : (
                            <MdOutlineAccountCircle size="4.5rem" color="#8B949E" className="avatarPlaceholderIcon" />
                        )}
                    </div>
                    
                    <div className="avatarActionControls">
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="button" className="btnChangeAvatar" onClick={triggerFileInput} disabled={isLoading}>
                                {isLoading ? "Uploading..." : "Change Avatar"}
                            </button>
                            
                            {avatarUrl && (
                                <button type="button" className="btnDeleteAvatar" onClick={handleReqDeleteAvatar} disabled={isLoading}>
                                    Delete Avatar
                                </button>
                            )}
                        </div>
                        <p className="avatarHint">JPG, PNG or GIF, Click circle or button to upload.</p>
                    </div>
                    
                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" style={{display: 'none'}}/>
                </div>
            </section>

            <section className="accountSection">
                <h2 className="sectionTitle">Change Email</h2>
                <p style={{ color: '#8b949e', marginBottom: '15px' }}>Current Email: <strong>{currentEmail}</strong></p>
                
                <form onSubmit={handleEmailChange} className="accountForm">
                    <div className="formGroup">
                        <label>New Email Address</label>
                        <input 
                            type="email" 
                            value={newEmail} 
                            onChange={(e) => setNewEmail(e.target.value)} 
                            required 
                            placeholder="new.email@example.com"
                        />
                    </div>
                    <div className="formGroup">
                        <label>Confirm Current Password</label>
                        <input 
                            type="password" 
                            value={emailPassword} 
                            onChange={(e) => setEmailPassword(e.target.value)} 
                            required 
                            placeholder="Enter password to confirm"
                        />
                    </div>

                    <button type="submit" className="btnSubmit">Update Email</button>
                </form>
            </section>

            <section className="accountSection">
                <h2 className="sectionTitle">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="accountForm">
                    <div className="formGroup">
                        <label>Current Password</label>
                        <input 
                            type="password" 
                            value={currentPassword} 
                            onChange={(e) => setCurrentPassword(e.target.value)} 
                            required 
                            placeholder="Current password"
                        />
                    </div>
                    <div className="formGroup">
                        <label>New Password</label>
                        <input 
                            type="password" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            required 
                            placeholder="Minimum 8 characters"
                        />
                    </div>
                    <div className="formGroup">
                        <label>Confirm New Password</label>
                        <input 
                            type="password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                            placeholder="Repeat new password"
                        />
                    </div>

                    <button type="submit" className="btnSubmit">Update Password</button>
                </form>
            </section>

            <section className="accountSection" style={{ borderBottom: 'none' }}>
                <h2 className="sectionTitle" style={{ color: '#f85149' }}>Danger Zone</h2>
                <p style={{ color: '#8b949e', marginBottom: '15px' }}>
                    Once you delete your account, there is no going back. Please be certain.
                </p>
                <button 
                    type="button" 
                    className="btnDeleteAvatar" 
                    onClick={handleReqDeleteAccount}
                    disabled={isLoading}
                >
                    {isLoading ? "Deleting..." : "Delete Account"}
                </button>
            </section>
        </div>
    );
}