import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SIGN_IN } from '../constant/router';
import { REGISTER_API_URL } from '../constant/apiURL'; // Замените на URL вашего API для регистрации
import { useAuth } from '../utils/AuthContext';

export default function SignUp() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [errorMessage, setErrorMessage] = useState('');
    const { saveDate } = useAuth(); // Для сохранения токена через контекст
    const navigate = useNavigate(); // Для перенаправления

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();

        try {
            const response = await axios.post(REGISTER_API_URL, formData); // Отправка данных на сервер
            console.log('Registration successful:', response.data);

            // Сохраняем токен через контекст
            saveDate(response.data);

            // Перенаправляем на главную страницу
            navigate('/');
        } catch (error) {
            console.error(
                'Registration failed:',
                error.response?.data || error.message
            );
            setErrorMessage(
                error.response?.data?.username[0] ||
                    'Registration failed. Please try again.'
            );
        }
    };

    return (
        <main className="main-content">
            <h1 className="sign-title">Sign Up</h1>

            <form className="sign-form" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <button type="submit" className="sign-button">
                    Submit
                </button>
                <p>
                    Already registered?{' '}
                    <NavLink to={SIGN_IN} className="sign-in-link">
                        Sign in.
                    </NavLink>
                </p>
            </form>
        </main>
    );
}
