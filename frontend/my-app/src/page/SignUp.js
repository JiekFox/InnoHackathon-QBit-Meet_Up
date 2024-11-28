import React from 'react';
import { NavLink } from 'react-router-dom';
import { SIGN_IN } from '../constant/router';
import { useSignUp } from '../utils/hooks/useSignUp';

export default function SignUp() {
    const {
        formData,
        errorMessage,
        showPassword,
        togglePasswordVisibility,
        handleInputChange,
        handleSubmit
    } = useSignUp();

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
                    <div className="password-container">
                        <input
                            type={showPassword ? 'text' : 'password'}
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
                            aria-label={
                                showPassword ? 'Скрыть пароль' : 'Показать пароль'
                            }
                        >
                            {showPassword ? '🔓' : '🔒'}
                        </span>
                    </div>
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
