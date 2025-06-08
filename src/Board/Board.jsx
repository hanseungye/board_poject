import React, { useState, useEffect } from 'react';
import styles from './board.module.css';
import axios from 'axios';
import BoardHeader from './BoardHeader';
import NoticeList from './NoticeList';
import Pagination from './Pagination';
import { useNavigate } from 'react-router-dom';

function Board() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const pageSize = 10;
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
  }, [currentPage, searchKeyword, url]);

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

  const handle_write = () => {
    navigate("/board/write");
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <BoardHeader
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
        setCurrentPage={setCurrentPage}
      />

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
      <NoticeList
        notices={notices}
        currentPage={currentPage}
        pageSize={pageSize}
        handle_remove={handle_remove}
      />

      {/* 페이지네이션 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      {/* 글쓰기 버튼 */}
      <button className={styles.writeBtn} onClick={handle_write}>✏️</button>
    </div>
  );
}

export default Board;
