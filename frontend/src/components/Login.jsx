import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';

import '../styles/Login.css';
import '../styles/share.css';

import { authService } from './utils/api';
import fullLogo from '../assets/fullLogo.webp';

import RecoveryPage from './RecoveryPage.jsx';
import ErrorMsg from './utils/ErrorMsg.jsx';

export default function Login() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const data = {
        email: '',
        password: '',
    };
    const [loginData, setLoginData] = useState(data);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        // 1. Sprawdzamy parametry URL wysłane po przekierowaniu z akcji e-mail
        const msgParam = searchParams.get('msg');
        const errorParam = searchParams.get('error');

        if (msgParam) {
            setNotification({ text: decodeURIComponent(msgParam), type: 'success' });
            // Czyścimy parametry z paska adresu dla czystego URL
            setSearchParams({}, { replace: true });
        } else if (errorParam) {
            setNotification({ text: decodeURIComponent(errorParam), type: 'error' });
            setSearchParams({}, { replace: true });
        } 
        // 2. Obsługa powiadomienia z przesyłanego stanu React Router (np. ConfirmChange)
        else if (location.state?.notification) {
            setNotification(location.state.notification);
            window.history.replaceState({}, document.title);
        }
    }, [location, searchParams, setSearchParams]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData({
            ...loginData,
            [name]: value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setNotification(null);

        try {
            const responseData = await authService.login(loginData);
            localStorage.setItem('token', responseData.access_token);

            navigate('/dashboard');
        } catch (err) {
            if (err.response && err.response.data) {
                setNotification({ 
                    text: err.response.data.detail || "Inserted login or password is incorrect!", 
                    type: 'error' 
                });
            } else {
                setNotification({ text: "Connection with server timeout", type: 'error' });
            }
        }
    };

    return (
        <main id='loginPage'>
            <ErrorMsg message={notification} />
            
            <div className='loginContainer'>
                <img src={fullLogo} alt="Logo SynthFlow" />
                <h4>Log in to continue</h4>
                <form onSubmit={handleLogin}>
                    <div id='inputsContainer'>
                        <label htmlFor="email">Login</label>
                        <input 
                            type="text" 
                            id="email"
                            name="email" 
                            value={loginData.email} 
                            onChange={handleChange} 
                            placeholder='Email' 
                            required
                        />
                        
                        <label htmlFor="password">Password</label>
                        <input 
                            type='password' 
                            id="password"
                            name="password" 
                            value={loginData.password} 
                            onChange={handleChange} 
                            placeholder='Password' 
                            required 
                        />
                    </div>
                    <div id='checkboxContainer'>
                        <input type="checkbox" name="remember" id="remember" />
                        <span>Remember me</span>
                    </div>
                    <button id='actionButton' type="submit">Login</button>
                    <div className='actionLinks'>
                        <Link to='/register'>Create account</Link>
                        <Link to='/recovery'>Reset password</Link>
                    </div>
                </form>
            </div>
        </main>
    );
}