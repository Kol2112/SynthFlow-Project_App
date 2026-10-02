import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from './api.js';
import { extractErrorMessage } from './helperFunctions.js';
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
                const data = await authService.confirmChange(token);
                
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');

                navigate('/login', { 
                    state: { 
                        notification: { 
                            text: data.message || "The change has been successfully confirmed! Please log in again", 
                            type: "success" 
                        } 
                    } 
                });
            } catch (error) {
                console.error("Server connection error", error);
                const errorText = extractErrorMessage(error, "An error occurred while confirming the changes");
                navigate('/login', { 
                    state: { 
                        notification: { 
                            text: errorText, 
                            type: "error" 
                        } 
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