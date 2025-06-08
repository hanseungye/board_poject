// components/Board/NoticeList.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './board.module.css';

function NoticeList({ notices, currentPage, pageSize, handle_remove }) {
  const navigate = useNavigate();

  return (
    <>
      {notices.map((notice, index) => (
        <div key={notice.id} className={styles.noticeItem}>
          <span>{(currentPage - 1) * pageSize + index + 1}</span>
          <div className={styles.titleBox}>
            <span
              className={styles.clickableTitle}
              onClick={() => navigate(`/notices/${notice.id}`, { state: { notice } })}
            >
              {notice.title}
            </span>
          </div>
          <span>{notice.author_name}</span>
          <span>{new Date(notice.created_at).toLocaleDateString()}</span>
          <span>{notice.views_count}</span>
          <button
            className={styles.deleteBtn}
            onClick={() => handle_remove(notice.id)}
          >
            삭제
          </button>
        </div>
      ))}
    </>
  );
}

export default NoticeList;
