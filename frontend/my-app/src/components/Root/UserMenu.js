import React, { useState } from 'react';
import DropdownItem from './DropdownItem';
import LogoutModal from '../LogoutModal';
import icon from '../../assets/img/icon.png';
import { MY_MEETUPS, PROFILE } from '../../constant/router';

export default function UserMenu({ userName }) {
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleCloseModal = () => {
        setShowLogoutModal(false);
    };

    return (
        <div className="user-info">
            <span className="user-name">{userName}</span>
            <img className="user-avatar" src={icon} alt="User Avatar" />
            <div className="user-dropdown">
                <DropdownItem
                    to={PROFILE}
                    title="Profile"
                    description="Explore your profile"
                />
                <DropdownItem
                    to={MY_MEETUPS}
                    title="My Meet Ups"
                    description="View all the meetings you have subscribed to"
                />
                <hr />
                <div
                    className="dropdown-item log-out"
                    onClick={handleLogoutClick}
                    role="button"
                >
                    Log Out
                </div>
            </div>
            {showLogoutModal && (
                <LogoutModal
                    onClose={handleCloseModal}
                    onConfirm={() => console.log('Logged out')}
                />
            )}
        </div>
    );
}
