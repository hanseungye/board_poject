// Board.jsx
import React from 'react';
import styles from './board.module.css';

function Board() {
  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.headerBox}>
        <h1 className={styles.title}>📢 전체 공지사항</h1>
        <input className={styles.searchInput} placeholder="공지사항 검색..." />
      </div>

      {/* 필터 탭 */}
      <div className={styles.tabBox}>
        <button className={`${styles.tab} ${styles.active}`}>전체</button>
        <button className={styles.tab}>중요</button>
        <button className={styles.tab}>신규</button>
        <button className={styles.tab}>긴급</button>
      </div>

      {/* 테이블 헤더 */}
      <div className={styles.tableHeader}>
        <span>번호</span>
        <span>제목</span>
        <span>작성자</span>
        <span>작성일</span>
        <span>조회수</span>
        <span className={styles.actionHeader}>관리</span>
      </div>

      {/* 공지 아이템 */}
      <div className={styles.noticeItem}>
        <span>15</span>
        <div className={styles.titleBox}>
          <span className={`${styles.badge} ${styles.emergency}`}>긴급</span>
          <span>시스템 점검으로 인한 서비스 일시 중단 안내</span>
        </div>
        <span>관리자</span>
        <span>2025.05.30</span>
        <span>1,245</span>
        <button className={styles.deleteBtn}>삭제</button>
      </div>

      <div className={styles.noticeItem}>
        <span>14</span>
        <div className={styles.titleBox}>
          <span className={`${styles.badge} ${styles.important}`}>중요</span>
          <span>개인정보 보호정책 개정 안내</span>
        </div>
        <span>관리자</span>
        <span>2025.05.28</span>
        <span>892</span>
        <button className={styles.deleteBtn}>삭제</button>
      </div>

      {/* 페이지네이션 */}
      <div className={styles.pagination}>
        <button>«</button>
        <button>‹</button>
        <button className={styles.activePage}>1</button>
        <button>2</button>
        <button>3</button>
        <button>›</button>
        <button>»</button>
      </div>

      {/* 글쓰기 버튼 */}
      <button className={styles.writeBtn}>✏️</button>
    </div>
  );
}

export default Board;
