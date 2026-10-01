import { Link } from 'react-router-dom';
import { useState } from 'react';

import ErrorMsg from './utils/ErrorMsg.jsx';
import { 
    validatePassword, 
    validateAge, 
    validateNameOrSurname, 
    extractErrorMessage 
} from './utils/helperFunctions.js';

import '../styles/Login.css';
import '../styles/share.css';

import fullLogo from '../assets/fullLogo.webp';
import { authService } from './utils/api';

export default function CreateAccount() {
    const rawData = {
        email: '',
        password: '',
        name: '',
        surname: '',
        birth_date: ''
    };
    const [formData, setFormData] = useState(rawData);
    const [notification, setNotification] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotification(null);

        const triggerNotification = (text, type = 'error') => {
            setNotification({ text, type, id: Date.now() });
        };

        if (formData.name) {
            const nameValidation = validateNameOrSurname(formData.name, "Name");
            if (!nameValidation.isValid) {
                triggerNotification(nameValidation.message);
                return;
            }
        }

        if (formData.surname) {
            const surnameValidation = validateNameOrSurname(formData.surname, "Surname");
            if (!surnameValidation.isValid) {
                triggerNotification(surnameValidation.message);
                return;
            }
        }

        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
            triggerNotification(passwordValidation.message);
            return;
        }

        const ageValidation = validateAge(formData.birth_date, 13);
        if (!ageValidation.isValid) {
            triggerNotification(ageValidation.message);
            return;
        }

        const payload = {
            ...formData,
            name: formData.name.trim() || null,
            surname: formData.surname.trim() || null,
            birth_date: formData.birth_date || null
        };

        try {
            await authService.register(payload);
            triggerNotification('Account created! Please check your email to activate it.', 'success');
            setFormData(rawData);
        } catch (error) {
            const errorMsg = extractErrorMessage(error, 'An error occurred during registration');
            triggerNotification(errorMsg);
        }
    };

    return (
        <main id='loginPage'>
            <ErrorMsg key={notification?.id} message={notification} />
            <div className='loginContainer'>
                <img src={fullLogo} alt="Logo SynthFlow" />
                <h4>Create your account</h4>
                <form onSubmit={handleSubmit}>
                    <div id='inputsContainer'>
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            id="email"
                            name='email' 
                            value={formData.email}  
                            onChange={handleChange} 
                            placeholder='Email' 
                            required 
                        />
                        
                        <div className="labelWithTooltip">
                            <label htmlFor="password">Password</label>
                            <span className="tooltipIcon">
                                ?
                                <span className="tooltipText">
                                    min. 12 chars, 1 uppercase, 1 special
                                </span>
                            </span>
                        </div>
                        <input 
                            type='password' 
                            id="password"
                            name='password' 
                            value={formData.password} 
                            onChange={handleChange} 
                            placeholder='Password' 
                            required
                        />

                        <label htmlFor="name">Name</label>
                        <input 
                            type="text" 
                            id="name"
                            name='name' 
                            value={formData.name}  
                            onChange={handleChange} 
                            placeholder='Name (min. 2 characters)' 
                        />

                        <label htmlFor="surname">Surname</label>
                        <input 
                            type="text" 
                            id="surname"
                            name='surname' 
                            value={formData.surname}  
                            onChange={handleChange} 
                            placeholder='Surname (min. 2 characters)' 
                        />

                        <label htmlFor="birth_date">Birth Date</label>
                        <input 
                            type='date' 
                            id="birth_date"
                            name='birth_date' 
                            value={formData.birth_date} 
                            onChange={handleChange} 
                            required
                        />
                    </div>
                    <div id='checkboxContainer'>
                        <input type="checkbox" name="terms" id="terms" required />
                        <label htmlFor="terms" className="clickableLabel">Accept the terms and conditions</label>
                    </div>
                    <button id='actionButton' type="submit">Create account</button>
                    <div className='actionLinks singleLink'>
                        <Link to='/'>Back to login</Link>
                    </div>
                </form>
            </div>
        </main>
    );
}