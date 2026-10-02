import { MdOutlineAccountCircle } from "react-icons/md";
import '../styles/Account.css';
import { useEffect, useRef, useState } from "react";
import ErrorMsg from "./utils/ErrorMsg.jsx";
import ConfirmationModal from "./utils/ConfirmationModal.jsx";
import { userService } from "./utils/api.js";
import { extractErrorMessage } from "./utils/helperFunctions.js";

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
    
    const [notification, setNotification] = useState(null);

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

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await userService.getMe();
                if (data.avatar_url) {
                    setAvatarUrl(data.avatar_url);
                }
                if (data.email) {
                    setCurrentEmail(data.email);
                }
            } catch (error) {
                console.error("Failed to fetch user data", error);
            }
        };
        fetchUserData();
    }, []);

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setNotification({ text: "File size should not exceed 2MB", type: "error" });
            return;
        }
        
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64Image = reader.result;
            setIsLoading(true);

            try {
                await userService.updateAvatar(base64Image);
                setAvatarUrl(base64Image);
                window.dispatchEvent(new Event("avatarUpdated"));
                setNotification({ text: "Avatar updated successfully!", type: "success" });
            } catch (error) {
                setNotification({ text: extractErrorMessage(error, "Failed to update avatar"), type: "error" });
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const executeDeleteAvatar = async () => {
        closeModal();
        setIsLoading(true);
        try {
            await userService.deleteAvatar();
            setAvatarUrl('');
            window.dispatchEvent(new Event("avatarUpdated"));
            setNotification({ text: "Avatar deleted successfully!", type: "success" });
        } catch (error) {
            setNotification({ text: extractErrorMessage(error, "Error deleting avatar"), type: "error" });
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

    const handleEmailChange = async (e) => {
        e.preventDefault();

        try {
            const data = await userService.requestEmailChange({ new_email: newEmail, password: emailPassword });
            setNewEmail('');
            setEmailPassword('');
            setNotification({ text: data.message || "Email change request sent!", type: 'success' });
        } catch (error) {
            setNotification({ text: extractErrorMessage(error, "Failed to request email change."), type: 'error' });
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setNotification({ text: "New passwords do not match!", type: 'error' });
            return;
        }

        try {
            const data = await userService.requestPasswordChange({ current_password: currentPassword, new_password: newPassword });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setNotification({ text: data.message || "Password changed successfully!", type: 'success' });
        } catch (error) {
            setNotification({ text: extractErrorMessage(error, "Failed to request password change."), type: 'error' });
        }
    };

    const executeDeleteAccount = async () => {
        closeModal();
        setIsLoading(true);
        try {
            await userService.deleteAccount();
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            window.location.href = "/login";
        } catch (error) {
            setNotification({ text: extractErrorMessage(error, "Failed to delete account."), type: 'error' });
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

    return (
        <div className="accountContainer">
            <ErrorMsg message={notification} />

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
                        <div className="avatarButtonsGroup">
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
                <p className="sectionText">Current Email: <strong>{currentEmail}</strong></p>
                
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
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Minimum 8 characters"/>
                    </div>
                    <div className="formGroup">
                        <label>Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Repeat new password"/>
                    </div>

                    <button type="submit" className="btnSubmit">Update Password</button>
                </form>
            </section>

            <section className="accountSection">
                <h2 className="sectionTitle dangerTitle">Danger Zone</h2>
                <p className="sectionText">Once you delete your account, there is no going back. Please be certain.</p>
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