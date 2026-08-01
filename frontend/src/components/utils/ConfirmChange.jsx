import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function ConfirmChange() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    
    // Guard zapobiegający podwójnemu wywołaniu w React 18 Strict Mode
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
                    // 1. Czyszczenie sesji - wylogowanie użytkownika
                    localStorage.removeItem('token');

                    // 2. Przekierowanie do panelu logowania z dynamicznym komunikatem z serwera
                    navigate('/login', { 
                        state: { 
                            notification: { 
                                text: data.message || "Zmiana została pomyślnie confirmed! Zaloguj się ponownie.", 
                                type: "success" 
                            } 
                        } 
                    });
                } else {
                    // Przekierowanie z błędem w przypadku unieważnionego/przedawnionego tokenu
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
        <div style={{ padding: '20px', color: '#fff', textAlign: 'center' }}>
            <h2>Trwa potwierdzanie zmian...</h2>
        </div>
    );
}