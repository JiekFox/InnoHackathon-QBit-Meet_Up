import React, { useState, useCallback, useEffect } from 'react';
import DropdownItem from './DropdownItem';
import LogoutModal from '../LogoutModal';
import icon from '../../assets/img/icon.png';
import { useAuth } from '../../utils/AuthContext';
import {
    MY_MEETUPS_OWNER,
    MY_MEETUPS_SUBSCRIBER,
    PROFILE,
    SIGN_IN
} from '../../constant/router';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface UserMenuProps {
    userName: string;
}

const UserMenu: React.FC<UserMenuProps> = React.memo(({ userName }) => {
    const { t } = useTranslation();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { removeToken, img } = useAuth();
    const navigate = useNavigate();
    const [logo, setLogo] = useState<string>(icon);

    useEffect(() => {
        if (img) {
            setLogo(img);
        } else {
            setLogo(icon);
        }
    }, [img]);

    const handleLogoutClick = useCallback(() => {
        setShowLogoutModal(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setShowLogoutModal(false);
    }, []);

    const handleConfirmLogout = useCallback(() => {
        removeToken();
        navigate(SIGN_IN);
    }, [removeToken, navigate]);

    return (
        <>
            <div className="user-info">
                <span className="user-name">{userName}</span>
                <img className="user-avatar" src={logo} alt="User Avatar" />
                <div className="user-dropdown">
                    <DropdownItem
                        to={PROFILE}
                        title={t('userMenu.profile')}
                        description={t('userMenu.profileDescription')}
                    />
                    <DropdownItem
                        to={MY_MEETUPS_SUBSCRIBER}
                        title={t('userMenu.myMeetupsSubscribed')}
                        description={t('userMenu.subscribedDescription')}
                    />
                    <DropdownItem
                        to={MY_MEETUPS_OWNER}
                        title={t('userMenu.myMeetupsOwned')}
                        description={t('userMenu.ownedDescription')}
                    />
                    <hr />
                    <div
                        className="dropdown-item log-out"
                        onClick={handleLogoutClick}
                        role="button"
                    >
                        {t('userMenu.logOut')}
                    </div>
                </div>
            </div>
            {showLogoutModal && (
                <LogoutModal
                    onClose={handleCloseModal}
                    onConfirm={handleConfirmLogout}
                />
            )}
        </>
    );
});

export default UserMenu;
