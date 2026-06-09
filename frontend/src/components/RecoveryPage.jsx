import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ErrorMsg from './utils/ErrorMsg.jsx';
import fullLogo from '../assets/fullLogo.webp';
import '../styles/Login.css';
import '../styles/share.css';

export default function RecoveryPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams(); 

    // 1. Pobieramy token bezpośrednio z URL podczas renderowania (nie potrzebujemy do tego stanu)
    const token = searchParams.get('token') || '';

    // 2. Jeśli token istnieje w URL, zaczynamy od kroku 2, w przeciwnym wypadku od kroku 1
    const [step, setStep] = useState(token ? 2 : 1);
    
    // Pozostałe stany formularza
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        try {
            await axios.post('http://localhost:8000/api/auth/forgot-password', { 
                email: email,
                password: ""
            });
            setSuccessMsg("If the account exists, a password reset link has been sent to your email.");
            setEmail('');
        } catch (err) {
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError("Connection with server timeout");
            }
        }
    };

    const handleSaveNewPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        try {
            // Używamy zmiennej 'token', która jest wyciągnięta na samej górze komponentu
            await axios.post(`http://localhost:8000/api/auth/reset-password?token=${token}&new_password=${newPassword}`);
            setSuccessMsg("Password successfully changed! Redirecting to login...");
            
            setTimeout(() => {
                navigate('/');
            }, 2500);
        } catch (err) {
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError("Invalid or expired token.");
            }
        }
    };

    return (
        <main id='loginPage'>
            {error && <ErrorMsg message={"Error occured!"}/>}

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
                        
                        {successMsg && (
                            <p style={{ color: '#2ea44f', textAlign: 'center', fontSize: '0.9rem', marginTop: '10px' }}>
                                {successMsg}
                            </p>
                        )}
                        
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
                                placeholder='Minimum 8 characters' 
                                required 
                            />
                        </div>
                        <button id='actionButton' type="submit">Update Password</button>
                        
                        {successMsg && (
                            <p style={{ color: '#2ea44f', textAlign: 'center', fontSize: '0.9rem', marginTop: '10px' }}>
                                {successMsg}
                            </p>
                        )}
                    </form>
                )}
            </div>
        </main>
    );
}