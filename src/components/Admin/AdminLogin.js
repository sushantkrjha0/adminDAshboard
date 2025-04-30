import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUser, FaSignInAlt } from 'react-icons/fa';
import axios from 'axios';
import '../../App.css';

// Email-password pairs with corresponding UUIDs
const AUTHORIZED_CREDENTIALS = {
  'naveen@ecombuddha.in': {
    password: 'Naveen@123',
    uuid: 'd1633d8a-00a1-7073-16e2-d2805d998a9f'
  },
  'sahaj005@gmail.com': {
    password: 'Sahaj@123',
    uuid: 'a113fd5a-1011-7063-3cf9-7ac0110aafe4'
  },
  'sushant@ecombuddha.in': {
    password: 'Sushant@123',
    uuid: '41d34dda-4061-7054-e597-123c1efef594'
  },
  'harshita@ecombuddha.in': {
    password: 'Harshita@123',
    uuid: '41331d0a-2001-7041-f1e8-dc538b4c4707'
  }
};

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-login if token is already stored
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const userUuid = localStorage.getItem('userUuid');
    
    if (adminToken && userUuid) {
      // Configure axios headers with the stored UUID
      axios.defaults.headers.common['X-User-UUID'] = userUuid;
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const lowerEmail = email.toLowerCase();
    const userCredentials = AUTHORIZED_CREDENTIALS[lowerEmail];

    if (!userCredentials) {
      setError('Unauthorized email address.');
      setIsLoading(false);
      return;
    }

    if (password !== userCredentials.password) {
      setError('Invalid password.');
      setIsLoading(false);
      return;
    }

    try {
      // Create admin info object
      const adminInfo = {
        email: lowerEmail,
        role: 'admin',
        loginTime: new Date().toISOString()
      };
      
      // Store admin info and UUID separately
      localStorage.setItem('adminToken', JSON.stringify(adminInfo));
      localStorage.setItem('adminEmail', lowerEmail);
      localStorage.setItem('userUuid', userCredentials.uuid);
      
      // Set UUID in axios default headers for all future requests
      axios.defaults.headers.common['X-User-UUID'] = userCredentials.uuid;
      
      // Redirect to admin dashboard
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
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