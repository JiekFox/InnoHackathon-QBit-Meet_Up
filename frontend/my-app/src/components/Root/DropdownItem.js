import React from 'react';
import { Link } from 'react-router-dom';

export default function DropdownItem({ to, title, description }) {
    return (
        <Link to={to} className="dropdown-title">
            <div className="dropdown-item">
                {title}

                <span className="dropdown-description">{description}</span>
            </div>
        </Link>
    );
}
