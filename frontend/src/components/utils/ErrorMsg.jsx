import { useEffect, useState } from 'react';
export default function ErrorMsg({errorMsg}){
    const [wrongData, setWrongData] = useState(errorMsg)
    useEffect(()=>{
            let timer;
            if(wrongData){
                timer = setTimeout(()=>{
                    setWrongData(false);
                },2000)
            }
    
            return ()=>clearTimeout(timer);
        },[wrongData])

    return(
        <div className='wrongDataContainer'><p className='wrongDataEl'>{errorMsg}</p></div>
    )

}