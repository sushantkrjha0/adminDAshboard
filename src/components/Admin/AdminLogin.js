import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUser, FaSignInAlt } from 'react-icons/fa';
import { login, isAuthenticated, setupAxiosInterceptors } from '../../utils/auth';
import '../../App.css';

// Initialize axios interceptors
setupAxiosInterceptors();

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-login if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="loginContainer">
      <div className="loginCard">
        <div className="loginHeader">
          <h1>
            <FaLock className="lockIcon" /> Admin Login
          </h1>
          <p>Enter your credentials to access the admin dashboard</p>
        </div>

        {error && (
          <div className="errorMessage">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="loginForm">
          <div className="inputGroup">
            <label htmlFor="email">
              <FaUser className="inputIcon" /> Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="loginInput"
            />
          </div>

          <div className="inputGroup">
            <label htmlFor="password">
              <FaLock className="inputIcon" /> Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="loginInput"
            />
          </div>

          <button 
            type="submit" 
            className="loginButton"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : (
              <>
                <FaSignInAlt className="buttonIcon" /> Login
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;