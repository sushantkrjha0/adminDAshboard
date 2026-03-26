import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { logout } from '../../utils/auth';
import Sidebar from './Sidebar';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Top Navigation Bar */}
        <header className={styles.topNav}>
          <div className={styles.navLeft}>
            <button 
              className={styles.menuButton}
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
            <div className={styles.breadcrumb}>
              <span className={styles.breadcrumbText}>
                {getPageTitle(location.pathname)}
              </span>
            </div>
          </div>
          
          <div className={styles.navRight}>
            <div className={styles.adminInfo}>
              <span className={styles.adminEmail}>
                {localStorage.getItem('adminEmail') || 'Admin'}
              </span>
            </div>
            <button
              className={styles.logoutButton}
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
              title="Logout"
            >
              <FaSignOutAlt />
              <span className={styles.logoutText}>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.pageContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Helper function to get page title from pathname
const getPageTitle = (pathname) => {
  if (pathname.includes('credit-requests')) {
    return 'Credit Request Management';
  }
  if (pathname.includes('users')) {
    return 'User Management';
  }
  if (pathname.includes('settings')) {
    return 'Settings';
  }
  return 'Dashboard';
};

export default AdminLayout; 