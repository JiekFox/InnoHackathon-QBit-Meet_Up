import React, { useState } from 'react';

export default function SignIn() {
    const [isModalOpen, setModalOpen] = useState(false);

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    return (
        <main className="main-content">
            <h1 className="sign-title">Log In</h1>
            <p className="sign-subtitle">Enter your data</p>
            <form className="sign-form">
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" />
                </div>
                <button type="submit" className="sign-button">
                    Sign In
                </button>
                <button
                    type="button"
                    className="forgot-password-link"
                    onClick={openModal}
                >
                    Forgot password?
                </button>
            </form>

            {isModalOpen && (
                <div className="logout-modal">
                    <div className="modal-content">
                        <span className="modal-close" onClick={closeModal}>
                            &times;
                        </span>
                        <form>
                            <div className="input-group">
                                <label htmlFor="reset-email">Email</label>
                                <input type="email" id="reset-email" name="email" />
                            </div>
                            <div className="modal-buttons">
                                <button
                                    type="button"
                                    className="button-decline"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="button-confirm">
                                    Reset Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
