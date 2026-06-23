import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function ActivationPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    
    const [status, setStatus] = useState('activating');
    const [msg, setMsg] = useState('Aktywuję Twoje konto, proszę czekać...');
    const  hasRequested = useRef(false);
    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMsg('Nieprawidłowy lub brakujący token aktywacyjny.');
            return;
        }

        if(hasRequested.current) return;
        hasRequested.current = true;

        axios.post(`http://localhost:8000/api/auth/activate?token=${token}`)
            .then(res => {
                setStatus('success');
                setMsg(res.data.message || 'Twoje konto zostało pomyślnie aktywowane!');
                setTimeout(() => navigate('/'), 3000);
            })
            .catch(err => {
                setStatus('error');
                setMsg(err.response?.data?.detail || 'Aktywacja nie powiodła się. Token mógł wygasnąć.');
            });
    }, [token, navigate]);

    return (
        <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1a1a1a', color: '#fff', fontFamily: 'Arial' }}>
            <div style={{ textAlign: 'center', padding: '40px', border: '1px solid #333', borderRadius: '8px', backgroundColor: '#242424', maxWidth: '400px', width: '100%' }}>
                <h2 style={{ marginBottom: '20px' }}>Aktywacja konta</h2>
                <p style={{ 
                    color: status === 'success' ? '#2ea44f' : status === 'error' ? '#ff3333' : '#0366d6',
                    fontSize: '1.1rem',
                    lineHeight: '1.5'
                }}>
                    {msg}
                </p>
                {status !== 'activating' && (
                    <div style={{ marginTop: '25px' }}>
                        <Link to="/" style={{ color: '#0366d6', textDecoration: 'none', fontWeight: 'bold' }}>Przejdź do strony logowania</Link>
                    </div>
                )}
            </div>
        </main>
    );
}