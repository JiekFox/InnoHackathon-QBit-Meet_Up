import React from 'react';

export default function LogoutModal({ onClose, onConfirm }) {
    return (
        <div className="logout-modal">
            <div className="modal-content">
                <span className="modal-close" onClick={onClose}>
                    &times;
                </span>
                <h2>Do you want to log out?</h2>
                <p>You will need to log in again to access your account.</p>
                <div className="modal-buttons">
                    <button className="button-decline" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="button-confirm" onClick={onConfirm}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
