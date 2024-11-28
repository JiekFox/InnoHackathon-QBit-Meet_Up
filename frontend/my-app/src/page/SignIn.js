import React from 'react';
import { NavLink } from 'react-router-dom';
import { SIGN_UP } from '../constant/router';
import { useSignIn } from '../utils/hooks/useSignIn';

export default function SignIn() {
    const {
        formData,
        errorMessage,
        isPending,
        showPassword,
        togglePasswordVisibility,
        handleInputChange,
        handleSubmit
    } = useSignIn();

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
