import React, { useState, useEffect } from 'react';
import styles from './Report.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// url 상수로 분리 (환경 변수 적용)
const url = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Report() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const pageSize = 10;

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await axios.get(
          `${url}/board/Nation?page=${currentPage}&limit=${pageSize}&search=${encodeURIComponent(searchKeyword)}`
        );
        console.log("서버 응답 데이터:", res.data);
        setBoards(res.data.boards || []);
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error("게시글 로딩 실패:", err);
        alert("서버에서 게시글을 가져오지 못했습니다.");
      }
    };

    fetchBoards();
  }, [currentPage, searchKeyword,url]);

  const handleClick = async (boardId) => {
    try {
      await axios.patch(`${url}/board/update/${boardId}`);
      navigate(`/report/${boardId}`, { state: { boards } });
    } catch (err) {
      console.error("조회수 증가 또는 이동 실패:", err);
    }
  };

  const handle_remove = async (id) => {
    try {
      const confirmDelete = window.confirm("정말 삭제 하시겠습니까?");
      if (!confirmDelete) return;

      await axios.delete(`${url}/board/delete/${id}`);
      setBoards((prev) => prev.filter((item) => item.id !== Number(id)));
    } catch (err) {
      console.error("데이터 삭제 요청 입니다.", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleWrite = () => {
    navigate("/report/write");
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.headerBox}>
        <h1 className={styles.title}>📢 전체 게시판</h1>
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

      {/* 게시글 리스트 */}
      {boards.map((board, index) => (
        <div key={board.id} className={styles.noticeItem}>
          <span>{(currentPage - 1) * pageSize + index + 1}</span>
          <span
            className={styles.clickableTitle}
            onClick={() => handleClick(board.id)}
            style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
          >
            {board.title}
          </span>
          <span>{board.author_name}</span>
          <span>{new Date(board.created_at).toLocaleDateString()}</span>
          <span>{board.views_count}</span>
          <button
            className={styles.deleteBtn}
            onClick={() => handle_remove(board.id)}
          >
            삭제
          </button>
        </div>
      ))}

      {/* 페이지네이션 */}
      <div className={styles.pagination}>
        <button
          className={styles.firstBtn}
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(1)}
        >
          «
        </button>
        <button
          className={styles.prevBtn}
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
        >
          ‹
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.activePage : ""}`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          className={styles.nextBtn}
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => p + 1)}
        >
          ›
        </button>
        <button
          className={styles.lastBtn}
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(totalPages)}
        >
          »
        </button>
      </div>

      {/* 글쓰기 버튼 */}
      <button className={styles.writeBtn} onClick={handleWrite}>✏️</button>
    </div>
  );
}

export default Report;
