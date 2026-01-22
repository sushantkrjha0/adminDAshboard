import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaCoins,
  FaUsers,
  FaChartBar,
  FaCog,
  FaBars,
  FaTimes,
  FaCreditCard,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCommentDots,
  FaShareAlt,
  FaCalendar,
  FaCalendarAlt,
  FaCalendarCheck
} from 'react-icons/fa';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation items - easily extendable for future features
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <FaChartBar />,
      path: '/admin/dashboard',
      description: 'Overview and statistics'
    },
    {
      id: 'credit-requests',
      label: 'Credit Requests',
      icon: <FaCoins />,
      path: '/admin/credit-requests',
      description: 'Manage user credit requests',
      subItems: [
        {
          id: 'pending',
          label: 'Pending Requests',
          icon: <FaClock />,
          path: '/admin/credit-requests?status=pending',
          description: 'Review pending credit requests'
        },
        {
          id: 'approved',
          label: 'Approved Requests',
          icon: <FaCheckCircle />,
          path: '/admin/credit-requests?status=approved',
          description: 'View approved requests'
        },
        {
          id: 'rejected',
          label: 'Rejected Requests',
          icon: <FaTimesCircle />,
          path: '/admin/credit-requests?status=rejected',
          description: 'View rejected requests'
        }
      ]
    },
    {
      id: 'users',
      label: 'User Management',
      icon: <FaUsers />,
      path: '/admin/users',
      description: 'Manage user accounts',
      subItems: [
        {
          id: 'daily-users',
          label: 'Daily',
          icon: <FaCalendar />,
          path: '/admin/users?view=daily',
          description: 'Daily user registration stats'
        },
        {
          id: 'weekly-users',
          label: 'Weekly',
          icon: <FaCalendarAlt />,
          path: '/admin/users?view=weekly',
          description: 'Weekly user registration stats'
        },
        {
          id: 'monthly-users',
          label: 'Monthly',
          icon: <FaCalendarCheck />,
          path: '/admin/users?view=monthly',
          description: 'Monthly user registration stats'
        }
      ]
    },
    {
      id: 'feedback',
      label: 'User Feedback',
      icon: <FaCommentDots />,
      path: '/admin/feedback',
      description: 'View and manage user feedback'
    },
    {
      id: 'referrals',
      label: 'User Referrals',
      icon: <FaShareAlt />,
      path: '/admin/referrals',
      description: 'View and manage user referrals'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <FaCog />,
      path: '/admin/settings',
      description: 'System configuration',
      disabled: true // Placeholder for future feature
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768) {
      toggleSidebar();
    }
  };

  const isActiveRoute = (path) => {
    if (path.includes('?')) {
      const basePath = path.split('?')[0];
      return location.pathname === basePath;
    }
    return location.pathname === path;
  };

  const renderSubItems = (subItems) => {
    if (!subItems) return null;

    return (
      <div className={styles.subItems}>
        {subItems.map((subItem) => (
          <div
            key={subItem.id}
            className={`${styles.subItem} ${isActiveRoute(subItem.path) ? styles.activeSubItem : ''}`}
            onClick={() => handleNavigation(subItem.path)}
          >
            <span className={styles.subItemIcon}>{subItem.icon}</span>
            <span className={styles.subItemLabel}>{subItem.label}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className={styles.mobileOverlay} onClick={toggleSidebar} />
      )}

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        {/* Sidebar header */}
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <FaCoins className={styles.logoIcon} />
            <span className={styles.logoText}>Admin Panel</span>
          </div>
          <button className={styles.closeButton} onClick={toggleSidebar}>
            <FaTimes />
          </button>
        </div>

        {/* Navigation items */}
        <nav className={styles.navigation}>
          {navigationItems.map((item) => (
            <div key={item.id} className={styles.navItem}>
              <div
                className={`${styles.navLink} ${isActiveRoute(item.path) ? styles.active : ''} ${item.disabled ? styles.disabled : ''}`}
                onClick={() => !item.disabled && handleNavigation(item.path)}
                title={item.description}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {item.disabled && <span className={styles.comingSoon}>Coming Soon</span>}
              </div>
              {renderSubItems(item.subItems)}
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.adminInfo}>
            <FaUsers className={styles.adminIcon} />
            <span>Admin Dashboard</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 