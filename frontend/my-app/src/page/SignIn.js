import React, { useState } from 'react';
import { NavLink } from "react-router-dom";
import { SIGN_UP } from "../constant/router";

export default function SignIn() {
    const [isModalOpen, setModalOpen] = useState(false);

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    return (
        <main className="main-content">
            <h1 className="sign-title">Log In</h1>
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
                <p>
                    You’re not with us yet?{'  '}
                    <NavLink to={SIGN_UP} className="sign-in-link">
                        Sign up!
                    </NavLink>
                </p>
            </form>

            {isModalOpen && (
              <div className='forgot-password'>
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
              </div>
            )}
        </main>
    );
}
