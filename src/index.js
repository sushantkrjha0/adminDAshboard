import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './contexts/AuthContext'; // ✅ import AuthProvider
import { BrowserRouter as Router } from 'react-router-dom'; // ✅ wrap with Router

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider> {/* ✅ Wrap App with AuthProvider */}
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
