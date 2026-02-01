import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { SIGN_UP } from '../constant/router';
import { useSignIn } from '../utils/hooks/useSignIn';
import { useTranslation } from 'react-i18next';

const SignIn: React.FC = () => {
    const {
        formData,
        errorMessage,
        isPending,
        showPassword,
        togglePasswordVisibility,
        handleInputChange,
        handleSubmit
    } = useSignIn();
    const { t } = useTranslation();

    return (
        <main className="main-content">
            <h1 className="sign-title">{t('signIn.title')}</h1>
            <form className="sign-form" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="username">{t('signIn.username')}</label>
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
                    <label htmlFor="password">{t('signIn.password')}</label>
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
                                showPassword
                                    ? t('signIn.hidePassword')
                                    : t('signIn.showPassword')
                            }
                        >
                            {showPassword ? '🔓' : '🔒'}
                        </span>
                    </div>
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <button type="submit" className="sign-button" disabled={isPending}>
                    {isPending ? t('signIn.pending') : t('signIn.submit')}
                </button>
                <p>
                    {t('signIn.noAccount')}{' '}
                    <NavLink to={SIGN_UP} className="sign-in-link" replace>
                        {t('signIn.signUp')}
                    </NavLink>
                </p>
            </form>
        </main>
    );
};

export default SignIn;
