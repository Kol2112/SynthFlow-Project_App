import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ErrorMsg from './utils/ErrorMsg.jsx';
import { validatePassword } from './utils/helperFunctions.js';
import fullLogo from '../assets/fullLogo.webp';
import '../styles/Login.css';
import '../styles/share.css';

export default function RecoveryPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams(); 
    const token = searchParams.get('token') || '';
    const [step] = useState(token ? 2 : 1);
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [msg, setMsg] = useState(null);

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setMsg(null);

        try {
            await axios.post('http://localhost:8000/api/auth/forgot-password', { 
                email: email
            });
            setMsg({ text: "If the account exists, a password reset link has been sent to your email.", type: 'success' });
            setEmail('');
        } catch (err) {
            if (err.response && err.response.data && err.response.data.detail) {
                setMsg({ text: err.response.data.detail, type: 'error' });
            } else {
                setMsg({ text: "Connection with server timeout", type: 'error' });
            }
        }
    };

    const handleSaveNewPassword = async (e) => {
        e.preventDefault();
        setMsg(null);

        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            setMsg({ text: passwordValidation.message, type: 'error' });
            return;
        }

        try {
            await axios.post('http://localhost:8000/api/auth/reset-password', {
                token: token,
                new_password: newPassword
            });
            setMsg({ text: "Password successfully changed! Redirecting to login...", type: 'success' });
            
            setTimeout(() => {
                navigate('/');
            }, 2500);
        } catch (err) {
            if (err.response?.data?.detail) {
                setMsg({ text: err.response.data.detail, type: 'error' });
            } else {
                setMsg({ text: "Invalid or expired token.", type: 'error' });
            }
        }
    };

    return (
        <main id='loginPage'>
            {msg && <ErrorMsg message={msg} />}

            <div className='loginContainer'>
                <img src={fullLogo} alt="Logo SynthFlow" />
                
                {step === 1 ? (
                    <form onSubmit={handleRequestReset}>
                        <h4>Reset your password</h4>
                        <div id='inputsContainer'>
                            <label htmlFor="emailInput">Enter your email address</label>
                            <input 
                                id="emailInput"
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder='Email' 
                                required
                            />
                        </div>
                        <button id='actionButton' type="submit">Send Reset Link</button>
                        
                        <div className='actionLinks singleLink'>
                            <Link to='/'>Back to login</Link>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleSaveNewPassword}>
                        <h4>Enter New Password</h4>
                        <div id='inputsContainer'>
                            <label htmlFor="passwordInput">New Password</label>
                            <input 
                                id="passwordInput"
                                type='password' 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                placeholder='Minimum 12 characters' 
                                required 
                            />
                        </div>
                        <button id='actionButton' type="submit">Update Password</button>
                    </form>
                )}
            </div>
        </main>
    );
}