import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import './i18n';

import Router from './components/Router';
const container = document.getElementById('root')
if (!container) throw new Error('Root element not found')
const root = ReactDOM.createRoot(container)
root.render(
    <React.StrictMode>
        <Router />
    </React.StrictMode>
);
