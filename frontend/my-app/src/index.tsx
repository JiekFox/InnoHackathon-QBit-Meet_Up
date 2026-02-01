import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import './i18n';

import Router from './components/Router';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Router />
    </React.StrictMode>
);
