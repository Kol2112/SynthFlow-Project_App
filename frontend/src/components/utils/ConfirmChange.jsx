import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../../styles/share.css';

export default function ConfirmChange() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    
    const hasCalledApi = useRef(false);

    useEffect(() => {
        if (!token || hasCalledApi.current) return;

        hasCalledApi.current = true;

        const confirmToken = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/auth/confirm-change?token=${token}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.removeItem('token');

                    navigate('/login', { 
                        state: { 
                            notification: { 
                                text: data.message || "Zmiana została pomyślnie potwierdzona! Zaloguj się ponownie.", 
                                type: "success" 
                            } 
                        } 
                    });
                } else {
                    navigate('/login', { 
                        state: { 
                            notification: { 
                                text: data.detail || "Wystąpił błąd podczas potwierdzania zmian.", 
                                type: "error" 
                            } 
                        } 
                    });
                }
            } catch (error) {
                console.error("Błąd połączenia z serwerem", error);
                navigate('/login', { 
                    state: { 
                        notification: { text: "Błąd połączenia z serwerem.", type: "error" } 
                    } 
                });
            }
        };

        confirmToken();
    }, [token, navigate]);

    return (
        <div className="confirmChangeContainer">
            <h2>Trwa potwierdzanie zmian...</h2>
        </div>
    );
}