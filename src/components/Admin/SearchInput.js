import React from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import styles from './SearchInput.module.css';

// Case-insensitive substring match on username + email.
export const filterByUserSearch = (users, query) => {
  const q = (query || '').trim().toLowerCase();
  if (!q) return users || [];
  return (users || []).filter((u) => {
    const name = (u.username || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    return name.includes(q) || email.includes(q);
  });
};

const SearchInput = ({ value, onChange, placeholder = 'Search by username or email…' }) => (
  <div className={styles.wrap}>
    <FaSearch className={styles.icon} />
    <input
      type="text"
      className={styles.input}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
    {value && (
      <button
        type="button"
        className={styles.clearBtn}
        onClick={() => onChange('')}
        aria-label="Clear search"
      >
        <FaTimes />
      </button>
    )}
  </div>
);

export default SearchInput;
