import { useEffect, useState } from 'react';
export default function ErrorMsg({message, type='error', errorMsg}){
    const displayMessage = (message && typeof message === 'object') ? message.text : (message || errorMsg);
    const messageType = typeof message === 'object' ? (message?.type || 'error') : type;
    const [visibleMessage, setVisibleMessage] = useState(displayMessage);
    
    useEffect(()=>{
        setVisibleMessage(displayMessage);

        if(displayMessage){
            const timer = setTimeout(()=>{
                setVisibleMessage(null);
            },3000);

            return () => clearTimeout(timer);
        }
    }, [displayMessage]);

    if(!visibleMessage) return null;
    return(
        <div className={`wrongDataContainer ${messageType}`}><p className='wrongDataEl'>{visibleMessage}</p></div>
    );

}