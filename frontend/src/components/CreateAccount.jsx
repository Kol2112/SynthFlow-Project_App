import { Link } from 'react-router-dom';
import { useState } from 'react';

import ErrorMsg from './utils/ErrorMsg.jsx';

import '../styles/Login.css';
import '../styles/share.css';

import fullLogo from '../assets/fullLogo.webp';
import { authService } from './utils/api';

export default function CreateAccount(){
    const rawData = {
        email: '',
        password: '',
        name: '',
        surname: '',
        birth_date: ''
    }
    const [formData, setFormData] = useState(rawData);
    const [errMsg, setErrMsg] = useState('');
    // const [successMsg, setSuccessMsg] = useState('');

    const handleChange = (e) =>{
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSubmit = async(e) =>{
        e.preventDefault();
        setErrMsg('');
        // setSuccessMsg('');

        const payload = {
            ...formData,
            birth_date: formData.birth_date ? `${formData.birth_date}T00:00:00` : null
        }

        try{
            const data = await authService.register(payload);
            // setSuccessMsg(data.message);

            setFormData(rawData)
        }
        catch(error){
            if (error.response && error.response.data) {
                const detail = error.response.data.detail;
                
                if (Array.isArray(detail)) {
                    setErrMsg(detail[0]?.msg || "Invalid data format");
                } else {
                    setErrMsg(detail || 'While register error occurred');
                }
            } 
            else {
                setErrMsg('While register error occurred');
            }
        }
    }
    return(
        <main id='loginPage'>
            {errMsg && <ErrorMsg errorMsg ={'Inserted data is incorrect!'} />}
            <div className='loginContainer'>
                <img src={fullLogo} alt="Logo SynthFlow" />
                <h4>Create your account</h4>
                <form onSubmit={handleSubmit}>
                    <div id='inputsContainer'>
                        <label htmlFor="">Email</label>
                        <input type="email" name='email' value={formData.email}  onChange={handleChange} placeholder='Email' required />
                        <label htmlFor="">Password</label>
                        <input type='password' name='password' value={formData.password} onChange={handleChange} placeholder='Password' required/>                        <label htmlFor="">Name</label>
                        <input type="text" name='name' value={formData.name}  onChange={handleChange} placeholder='Name' />
                        <label htmlFor="">Surname</label>
                        <input type="text" name='surname' value={formData.surname}  onChange={handleChange} placeholder='Surname' />
                        <label htmlFor="">Birth Date</label>
                        <input type='date' name='birth_date' value={formData.birth_date} onChange={handleChange} placeholder='Birth Date' required/>
                    </div>
                    <div id='checkboxContainer'>
                        <input type="checkbox" name="remember" id="" /><span>Akceptuje regulamin</span>
                    </div>
                    <button id='actionButton' type="submit">Create account</button>
                    <div className='actionLinks singleLink'>
                        <Link to='/'>Back to login</Link>
                    </div>
                </form>
            </div>
        </main>
    )
}