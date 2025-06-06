import React, { useState, useEffect } from 'react';
import styles from './board.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Board() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);         // 공지사항 목록
  const [currentPage, setCurrentPage] = useState(1);  // 현재 페이지
  const [total, setTotal] = useState(0);              // 전체 게시글 수
  const [searchKeyword, setSearchKeyword] = useState('');
  const pageSize = 10;                                // 한 페이지당 게시글 수
  const url = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await axios.get(
          `${url}/notices/list?page=${currentPage}&limit=${pageSize}&search=${encodeURIComponent(searchKeyword)}`
        );
        const noticeData = res.data.notices || [];

        const noticesWithFiles = await Promise.all(
          noticeData.map(async (notice) => {
            try {
              const fileRes = await axios.get(`${url}/notices/files/${notice.id}`);
              return {
                ...notice,
                file: fileRes.data.files[0]?.filename || null,
              };
            } catch {
              return { ...notice, file: null };
            }
          })
        );

        setNotices(noticesWithFiles);
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error("공지사항 로드 실패:", err);
        alert("공지사항을 불러오는 중 오류가 발생했습니다.");
      }
    };

    fetchNotices();
  }, [currentPage, searchKeyword,url]);

  // 🔥 삭제 기능
  const handle_remove = async (id) => {
    const confirmDelete = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${url}/notices/${id}`);
      setNotices((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // ✏️ 글쓰기 버튼
  const handle_write = () => {
    navigate("/board/write");
  };

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.headerBox}>
        <h1 className={styles.title}>📢 보고서 게시판</h1>
        <input
          className={styles.searchInput}
          placeholder="공지사항 검색..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setCurrentPage(1);
          }}
        />
      </div>

      {/* 탭 */}
      <div className={styles.tabBox}>
        <button className={`${styles.tab} ${styles.active}`}>전체</button>
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

      {/* 공지사항 목록 */}
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

      {/* 페이지네이션 */}
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

      {/* 글쓰기 버튼 */}
      <button className={styles.writeBtn} onClick={handle_write}>✏️</button>
    </div>
  );
}

export default Board;
