import React, { useEffect, useState } from 'react';
import {
  FaTimes,
  FaSpinner,
  FaFileAlt,
  FaStar,
  FaTag,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
} from 'react-icons/fa';
import adminService from '../../services/adminService';
import { formatIst } from '../../utils/dateFormat';
import styles from './UserActivityModal.module.css';
import Pagination, { PAGE_SIZE } from './Pagination';

const TABS = [
  { key: 'generations', label: 'Generations', icon: FaFileAlt },
  { key: 'listing_scores', label: 'Listing Scores', icon: FaStar },
  { key: 'deal_tags', label: 'Deal Tags', icon: FaTag },
];

const statusBadge = (status) => {
  const s = (status || '').toString().toUpperCase();
  if (['SUCCESS', 'COMPLETED', 'COMPLETE', 'DONE'].includes(s)) {
    return <span className={`${styles.statusPill} ${styles.statusSuccess}`}><FaCheckCircle /> {s || 'SUCCESS'}</span>;
  }
  if (['FAILED', 'FAILURE', 'ERROR'].includes(s)) {
    return <span className={`${styles.statusPill} ${styles.statusFailed}`}><FaTimesCircle /> {s}</span>;
  }
  if (['PENDING', 'PROGRESS', 'IN_PROGRESS', 'QUEUED'].includes(s)) {
    return <span className={`${styles.statusPill} ${styles.statusPending}`}><FaHourglassHalf /> {s}</span>;
  }
  return <span className={styles.statusPill}>{s || 'N/A'}</span>;
};

const UserActivityModal = ({ userUuid, initialTab = 'generations', onClose }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'single' | 'bulk'
  const [page, setPage] = useState(1);

  // Reset to page 1 + clear filter whenever the user switches tabs
  useEffect(() => {
    setPage(1);
    setTypeFilter('all');
  }, [activeTab]);

  useEffect(() => { setPage(1); }, [typeFilter]);

  // Pull single/bulk counts for the current tab from the summary
  const tabCounts = (() => {
    const s = data?.summary || {};
    if (activeTab === 'generations') {
      return {
        all: s.generations_total ?? 0,
        single: s.generations_single ?? 0,
        bulk: s.generations_bulk ?? 0,
      };
    }
    if (activeTab === 'listing_scores') {
      return {
        all: s.listing_scores_total ?? 0,
        single: s.listing_scores_single ?? 0,
        bulk: s.listing_scores_bulk ?? 0,
      };
    }
    return {
      all: s.deal_tags_total ?? 0,
      single: s.deal_tags_single ?? 0,
      bulk: s.deal_tags_bulk ?? 0,
    };
  })();

  const matchesType = (kind) => {
    if (typeFilter === 'all') return true;
    return kind === typeFilter;
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const resp = await adminService.getUserActivity(userUuid, 100);
        if (!cancelled) {
          if (resp.success) {
            setData(resp);
          } else {
            setError(resp.message || 'Failed to load activity');
          }
        }
      } catch (e) {
        if (!cancelled) setError(typeof e === 'string' ? e : (e.message || 'Failed to load activity'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [userUuid]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const renderGenerations = () => {
    const raw = data?.generations || [];
    if (raw.length === 0) return <div className={styles.emptyState}>No generations yet.</div>;
    const items = raw.filter((g) => matchesType(g.is_bulk ? 'bulk' : 'single'));
    if (items.length === 0) return <div className={styles.emptyState}>No {typeFilter} generations.</div>;
    const start = (page - 1) * PAGE_SIZE;
    const pagedItems = items.slice(start, start + PAGE_SIZE);
    return (
      <table className={styles.activityTable}>
        <thead>
          <tr>
            <th>Type</th>
            <th>Project / ASIN</th>
            <th>Status</th>
            <th>Created (IST)</th>
          </tr>
        </thead>
        <tbody>
          {pagedItems.map((g) => (
            <tr key={g.task_id || `${g.created_at_ist}-${g.project_name}`}>
              <td>
                <span className={g.is_bulk ? styles.bulkTag : styles.singleTag}>
                  {g.is_bulk ? 'Bulk' : 'Single'}
                </span>
                <small className={styles.subText}>{g.request_type}</small>
              </td>
              <td>{g.project_name || '—'}</td>
              <td>{statusBadge(g.status)}</td>
              <td>{formatIst(g.created_at_ist)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderListingScores = () => {
    const raw = data?.listing_scores || [];
    if (raw.length === 0) return <div className={styles.emptyState}>No listing scores yet.</div>;
    const items = raw.filter((s) => matchesType(s.type));
    if (items.length === 0) return <div className={styles.emptyState}>No {typeFilter} listing scores.</div>;
    const start = (page - 1) * PAGE_SIZE;
    const pagedItems = items.slice(start, start + PAGE_SIZE);
    return (
      <table className={styles.activityTable}>
        <thead>
          <tr>
            <th>Type</th>
            <th>ASIN(s)</th>
            <th>Score</th>
            <th>Status</th>
            <th>Created (IST)</th>
          </tr>
        </thead>
        <tbody>
          {pagedItems.map((s, idx) => (
            <tr key={s.task_id || `${s.asin}-${s.created_at_ist}-${idx}`}>
              <td>
                <span className={s.type === 'bulk' ? styles.bulkTag : styles.singleTag}>
                  {s.type === 'bulk' ? `Bulk × ${s.asin_count}` : 'Single'}
                </span>
              </td>
              <td className={styles.asinCell}>
                {s.type === 'bulk'
                  ? (s.asins && s.asins.length > 0 ? s.asins.slice(0, 3).join(', ') + (s.asins.length > 3 ? `, +${s.asins.length - 3}` : '') : '—')
                  : (s.asin || '—')}
              </td>
              <td>
                {s.score != null
                  ? <span className={styles.scoreBadge}>{s.score}%</span>
                  : <span className={styles.subText}>—</span>}
              </td>
              <td>{statusBadge(s.task_status || 'SUCCESS')}</td>
              <td>{formatIst(s.created_at_ist)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderDealTags = () => {
    const raw = data?.deal_tags || [];
    if (raw.length === 0) return <div className={styles.emptyState}>No deal tag checks yet.</div>;
    const items = raw.filter((d) => matchesType(d.request_type));
    if (items.length === 0) return <div className={styles.emptyState}>No {typeFilter} deal tag checks.</div>;
    const start = (page - 1) * PAGE_SIZE;
    const pagedItems = items.slice(start, start + PAGE_SIZE);
    return (
      <table className={styles.activityTable}>
        <thead>
          <tr>
            <th>Type</th>
            <th>ASIN(s)</th>
            <th>Zipcodes</th>
            <th>Status</th>
            <th>Created (IST)</th>
          </tr>
        </thead>
        <tbody>
          {pagedItems.map((d, idx) => (
            <tr key={d.task_id || `${d.created_at_ist}-${idx}`}>
              <td>
                <span className={d.request_type === 'bulk' ? styles.bulkTag : styles.singleTag}>
                  {d.request_type === 'bulk' ? `Bulk × ${d.asin_count}` : `Single × ${d.asin_count || 1}`}
                </span>
              </td>
              <td className={styles.asinCell}>
                {d.asins && d.asins.length > 0
                  ? d.asins.slice(0, 3).join(', ') + (d.asins.length > 3 ? `, +${d.asins.length - 3}` : '')
                  : '—'}
              </td>
              <td className={styles.subText}>
                {d.zipcodes && d.zipcodes.length > 0 ? d.zipcodes.join(', ') : '—'}
              </td>
              <td>{statusBadge(d.task_status)}</td>
              <td>{formatIst(d.created_at_ist)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const user = data?.user;
  const summary = data?.summary || {};

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>

        <div className={styles.modalHeader}>
          {user?.picture ? (
            <img src={user.picture} alt={user.username} className={styles.modalAvatar} />
          ) : (
            <div className={styles.modalAvatarPlaceholder}>
              {(user?.username || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className={styles.modalTitle}>{user?.username || 'User'}</h2>
            <p className={styles.modalSubtitle}>{user?.email || userUuid}</p>
            <div className={styles.modalMeta}>
              <span><b>Credits:</b> {user?.current_credits ?? '—'}</span>
              <span><b>Account:</b> {user?.account_type || '—'}</span>
            </div>
          </div>
        </div>

        {/* Summary chips */}
        <div className={styles.summaryRow}>
          <button
            className={`${styles.summaryChip} ${activeTab === 'generations' ? styles.summaryChipActive : ''}`}
            onClick={() => setActiveTab('generations')}
          >
            <FaFileAlt /> Generations
            <span className={styles.summaryCount}>{summary.generations_total ?? 0}</span>
          </button>
          <button
            className={`${styles.summaryChip} ${activeTab === 'listing_scores' ? styles.summaryChipActive : ''}`}
            onClick={() => setActiveTab('listing_scores')}
          >
            <FaStar /> Listing Scores
            <span className={styles.summaryCount}>{summary.listing_scores_total ?? 0}</span>
          </button>
          <button
            className={`${styles.summaryChip} ${activeTab === 'deal_tags' ? styles.summaryChipActive : ''}`}
            onClick={() => setActiveTab('deal_tags')}
          >
            <FaTag /> Deal Tags
            <span className={styles.summaryCount}>{summary.deal_tags_total ?? 0}</span>
          </button>
        </div>

        {/* Type filter (All / Single / Bulk) for the active tab */}
        {!isLoading && !error && (
          <div className={styles.filterRow}>
            <button
              type="button"
              className={`${styles.filterChip} ${typeFilter === 'all' ? styles.filterChipActive : ''}`}
              onClick={() => setTypeFilter('all')}
            >
              All <span className={styles.filterCount}>{tabCounts.all}</span>
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${typeFilter === 'single' ? styles.filterChipActive : ''}`}
              onClick={() => setTypeFilter('single')}
            >
              Single <span className={styles.filterCount}>{tabCounts.single}</span>
            </button>
            <button
              type="button"
              className={`${styles.filterChip} ${typeFilter === 'bulk' ? styles.filterChipActive : ''}`}
              onClick={() => setTypeFilter('bulk')}
            >
              Bulk <span className={styles.filterCount}>{tabCounts.bulk}</span>
            </button>
          </div>
        )}

        {/* Body */}
        <div className={styles.modalBody}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <FaSpinner className={styles.spinner} />
              <p>Loading activity…</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>{error}</div>
          ) : (
            <>
              {activeTab === 'generations' && renderGenerations()}
              {activeTab === 'listing_scores' && renderListingScores()}
              {activeTab === 'deal_tags' && renderDealTags()}
              {(() => {
                const raw = data?.[activeTab] || [];
                const filtered = raw.filter((d) => {
                  if (typeFilter === 'all') return true;
                  if (activeTab === 'generations') return (d.is_bulk ? 'bulk' : 'single') === typeFilter;
                  if (activeTab === 'listing_scores') return d.type === typeFilter;
                  return d.request_type === typeFilter;
                });
                const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
                if (filtered.length === 0) return null;
                return (
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    total={filtered.length}
                    onPageChange={setPage}
                    label={activeTab === 'generations' ? 'generations' : activeTab === 'listing_scores' ? 'scores' : 'tasks'}
                  />
                );
              })()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserActivityModal;
