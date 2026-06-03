import { useEffect, useState } from 'react';
export default function ErrorMsg(){
    
    useEffect(()=>{
            let timer;
            if(wrongLogin){
                timer = setTimeout(()=>{
                    setWrongLogin(false);
                },2000)
            }
    
            return ()=>clearTimeout(timer);
        },[wrongLogin])

    return(
        <span>{wrongLogin && (<div className='wrongDataContainer'><p className='wrongDataEl'>Inserted login or password is incorrect!</p></div>)}</span>
    )

}