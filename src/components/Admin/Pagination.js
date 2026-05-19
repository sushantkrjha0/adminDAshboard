import React from 'react';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import styles from './Pagination.module.css';

export const PAGE_SIZE = 20;

// usePagination(items): returns the current page slice, controls, and metadata.
// Use like: const { pageItems, page, setPage, totalPages, total } = usePagination(filteredUsers)
export const usePagination = (items, pageSize = PAGE_SIZE) => {
  const [page, setPage] = React.useState(1);
  const total = Array.isArray(items) ? items.length : 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  React.useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const start = (page - 1) * pageSize;
  const pageItems = (items || []).slice(start, start + pageSize);

  return { pageItems, page, setPage, totalPages, total, pageSize, start };
};

const Pagination = ({ page, totalPages, total, pageSize = PAGE_SIZE, onPageChange, label = 'items' }) => {
  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const go = (p) => {
    const clamped = Math.max(1, Math.min(totalPages, p));
    if (clamped !== page) onPageChange(clamped);
  };

  return (
    <div className={styles.paginationBar}>
      <span className={styles.info}>
        Showing <b>{start}</b>–<b>{end}</b> of <b>{total}</b> {label}
      </span>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.pageButton}
          onClick={() => go(1)}
          disabled={!canPrev}
          title="First page"
          aria-label="First page"
        >
          <FaAngleDoubleLeft />
        </button>
        <button
          type="button"
          className={styles.pageButton}
          onClick={() => go(page - 1)}
          disabled={!canPrev}
          title="Previous page"
          aria-label="Previous page"
        >
          <FaChevronLeft />
        </button>
        <span className={styles.pageIndicator}>
          Page <b>{page}</b> of <b>{totalPages}</b>
        </span>
        <button
          type="button"
          className={styles.pageButton}
          onClick={() => go(page + 1)}
          disabled={!canNext}
          title="Next page"
          aria-label="Next page"
        >
          <FaChevronRight />
        </button>
        <button
          type="button"
          className={styles.pageButton}
          onClick={() => go(totalPages)}
          disabled={!canNext}
          title="Last page"
          aria-label="Last page"
        >
          <FaAngleDoubleRight />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
