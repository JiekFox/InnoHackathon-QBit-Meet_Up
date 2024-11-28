import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Добавляем useNavigate
import axios from 'axios';
import { useAuth } from '../utils/AuthContext';
import { SIGN_UP } from '../constant/router';
import { TOKEN_API_URL } from '../constant/apiURL';

export default function SignIn() {
    const { saveDate } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setIsPending(true);
        try {
            const response = await axios.post(TOKEN_API_URL, {
                username: formData.username,
                password: formData.password
            });
            console.log('Login successful:', response.data);
            saveDate(response.data);
            /*saveToken({
                refresh: response.refresh_token,
                access: response.access_token
            }); */

            navigate('/');
        } catch (error) {
            console.error('Login failed:', error.response?.data || error.message);
            setErrorMessage('Invalid username or password. Please try again.');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <main className="main-content">
            <h1 className="sign-title">Log In</h1>
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
                    <label htmlFor="password">Password</label>
                    <div className="password-container">
                        <input
                            type={showPassword ? 'text' : 'password'} // Меняем тип в зависимости от состояния
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            className="password-input"
                        />
                        <span
                            className="toggle-password"
                            onClick={togglePasswordVisibility}
                            role="button"
                            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                        >
                        {showPassword ? '🔓' : '🔒'}
                        </span>
                    </div>
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <button type="submit" className="sign-button" disabled={isPending}>
                    Sign In
                </button>
                <p>
                    You’re not with us yet?{' '}
                    <NavLink to={SIGN_UP} className="sign-in-link">
                        Sign up!
                    </NavLink>
                </p>
            </form>
        </main>
    );
}
