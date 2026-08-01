import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function useAutoRefreshAuth(){
    const navigate = useNavigate();
    const lastRefreshRef = useRef(Date.now());
    useEffect(()=>{
        const REFRESH_INTERVAL = 5 * 60 * 1000;
        const events = ['mousemove', 'keydown', 'click', 'scroll']
        
        const handleUserActivity = async() =>{
            const now = Date.now();
            if(now - lastRefreshRef.current > REFRESH_INTERVAL){
                lastRefreshRef.current = now;
                const token = localStorage.getItem("token");
                
                if(!token) return;

                try{
                    const res = await axios.post('http://localhost:8000/api/auth/refresh', {}, {
                        headers: {Authorization: `Bearer ${token}`}
                    });
                    localStorage.setItem('token', res.data.access_token);
                }catch(err){
                    console.error('Session expired:', err);
                    localStorage.removeItem('token');
                    navigate('/', {replace: true})
                }
            }
        };
        events.forEach(event => window.addEventListener(event, handleUserActivity))

        return () => {
            events.forEach(event => window.removeEventListener(event, handleUserActivity))
        }
    }, [navigate])
}