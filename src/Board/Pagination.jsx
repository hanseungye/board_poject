// components/Board/Pagination.jsx
import React from 'react';
import styles from './board.module.css';

function Pagination({ currentPage, totalPages, setCurrentPage }) {
  return (
    <div className={styles.pagination}>
      <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>«</button>
      <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹</button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          className={currentPage === i + 1 ? styles.activePage : ''}
          onClick={() => setCurrentPage(i + 1)}
        >
          {i + 1}
        </button>
      ))}
      <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>›</button>
      <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>»</button>
    </div>
  );
}

export default Pagination;
