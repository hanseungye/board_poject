// components/Board/BoardHeader.jsx
import React from 'react';
import styles from './board.module.css';

function BoardHeader({ searchKeyword, setSearchKeyword, setCurrentPage }) {
  return (
    <div className={styles.headerBox}>
      <h1 className={styles.title}>📢 보고서 게시판</h1>
      <input
        className={styles.searchInput}
        placeholder="공지사항 검색..."
        value={searchKeyword}
        onChange={e => setSearchKeyword(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') setCurrentPage(1);
        }}
      />
    </div>
  );
}

export default BoardHeader;
