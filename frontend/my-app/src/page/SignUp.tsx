import React from 'react';
import { NavLink } from 'react-router-dom';
import { SIGN_IN } from '../constant/router';
import { useSignUp } from '../utils/hooks/useSignUp';
import { FieldError } from '../components/FieldError';
import { useTranslation } from 'react-i18next';

export default function SignUp() {
    const {
        formData,
        errorMessage,
        showPassword,
        getFieldError,
        togglePasswordVisibility,
        handleInputChange,
        handleBlur,
        handleSubmit,
        isPending
    } = useSignUp();
    const { t } = useTranslation();

    return (
        <div className="main-content">
            <h1 className="sign-title">{t('signUp.title')}</h1>
            <form className="sign-form" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="username">{t('signUp.username')}</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        required
                    />
                    <FieldError error={getFieldError('username')} />
                </div>
                <div className="input-group">
                    <label htmlFor="email">{t('signUp.email')}</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        required
                    />
                    <FieldError error={getFieldError('email')} />
                </div>
                <div className="input-group">
                    <label htmlFor="password">{t('signUp.password')}</label>
                    <div className="password-container">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            required
                            className="password-input"
                        />
                        <span
                            className="toggle-password"
                            onClick={togglePasswordVisibility}
                            role="button"
                            aria-label={
                                showPassword
                                    ? t('signUp.hidePassword')
                                    : t('signUp.showPassword')
                            }
                        >
                            {showPassword ? '🔓' : '🔒'}
                        </span>
                    </div>
                    <FieldError error={getFieldError('password')} />
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <button type="submit" className="sign-button">
                    {isPending ? t('signUp.pending') : t('signUp.submit')}
                </button>
                <p>
                    {t('signUp.alreadyAccount')}{' '}
                    <NavLink to={SIGN_IN} className="sign-in-link" replace>
                        {t('signUp.signIn')}
                    </NavLink>
                </p>
            </form>
        </div>
    );
}
