import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';

import { authService } from './utils/api';
import ErrorMsg from './utils/ErrorMsg.jsx';

import '../styles/Login.css';
import '../styles/share.css';

import fullLogo from '../assets/fullLogo.webp';

export default function Login() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setLoginData((prev) => ({ ...prev, email: savedEmail }));
            setRememberMe(true);
        }
        const msgParam = searchParams.get('msg');
        const errorParam = searchParams.get('error');

        if (msgParam) {
            setNotification({ text: decodeURIComponent(msgParam), type: 'success' });
            setSearchParams({}, { replace: true });
        } else if (errorParam) {
            setNotification({ text: decodeURIComponent(errorParam), type: 'error' });
            setSearchParams({}, { replace: true });
        } else if (location.state?.notification) {
            setNotification(location.state.notification);
            window.history.replaceState({}, document.title);
        }
    }, [location, searchParams, setSearchParams]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            setRememberMe(checked);
        } else {
            setLoginData((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setNotification(null);

        try {
            const responseData = await authService.login(loginData);
            localStorage.setItem('token', responseData.access_token);
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', loginData.email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            navigate('/dashboard');
        } catch (err) {
            if (err.response && err.response.data) {
                let errorMessage = "Inserted login or password is incorrect!";
                const detail = err.response.data.detail;

                if (typeof detail === 'string') {
                    errorMessage = detail;
                } else if (Array.isArray(detail) && detail.length > 0) {
                    errorMessage = detail[0].msg || "Invalid format of provided data!";
                }

                setNotification({ 
                    text: errorMessage, 
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
                        <input 
                            type="checkbox" 
                            name="remember" 
                            id="remember"
                            checked={rememberMe}
                            onChange={handleChange}
                        />
                        <label>Remember me</label>
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