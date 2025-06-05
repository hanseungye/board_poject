// Board.jsx
import React, { useState, useEffect } from 'react';
import styles from './board.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
function Board() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);         // 공지사항 데이터를 저장하는 상태
  const [currentPage, setCurrentPage] = useState(1);  // 현재 페이지 번호 (기본값: 1)
  const [total, setTotal] = useState(0);              // 전체 공지사항 개수
  const pageSize = 10;                                // 한 페이지에 표시할 공지사항 수
  const [searchKeyword,setSearchKeyword] = useState('');
  const handle_write = () => {
    navigate("/board/write");
  }
  useEffect(()=>{
    console.log("notices 데이터는?",notices);
  },[notices]);
  useEffect(() => {
    axios.get(
      `http://localhost:5000/notices/list?page=${currentPage}&limit=${pageSize}&search=${encodeURIComponent(searchKeyword)}`)
      .then(async(res) => {
        const noticeData = res.data.notices;
        const noticesWithFiles = await Promise.all(
          noticeData.map(async (notice) => {
            try{
              const fileRes = await axios.get(`http://localhost:5000/notices/files/${notice.id}`);
              return {...notice,file: fileRes.data.files[0]?.filename || null};
            } catch {
              return {...notice,file:null};
            }
          })
        );
        setNotices(noticesWithFiles);
        console.log(notices);
        setTotal(res.data.total);
      })
      .catch(err => console.error("공지사항 로드 실패", err));
  }, [currentPage]);
  // 삭제 버튼 함수.
  const handle_remove = async (id) => {
    const confirmDelete = window.confirm("정말 삭제하겠습니까?");
    if(!confirmDelete) return;
    try{
      await axios.delete(`http://localhost:5000/notices/${id}`);
      setNotices((prev) => prev.filter((item)=> item.id !== id)); // 필터링 함수
    } catch(err){
      console.error("삭제 실패:",err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  } 
  const totalPages = Math.ceil(total / pageSize); // 총 페이지 수.
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
          onKeyDown={(e)=>{
            if(e.key === "Enter"){
              setCurrentPage(1); // 검색시 1 페이지로.
            }
          }}
        />
      </div>

      {/* 필터 탭 */}
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

      {/* 공지 아이템 */}
      {notices.map((notice, index) => (
        <div key={index} className={styles.noticeItem}>
          <span>{notice.id}</span>
          <div className={styles.titleBox}>
            {/* 중요/긴급 표시 로직이 있다면 여기에 추가 */}
            <span
              className={styles.clickableTitle}
              onClick={() => navigate(`/notices/${notice.id}`,{state:{notice}})}
            >
              {notice.title}
            </span>
          </div>
          <span>{notice.author_name}</span>
          <span>{new Date(notice.created_at).toLocaleDateString()}</span>
          <span>{notice.views_count}</span>
          <button 
            className ={styles.deleteBtn}
             onClick={()=>handle_remove(notice.id)}
          >
            삭제
          </button>
        </div>
      ))}
      {/* 페이지네이션 */}
      <div className={styles.pagination}>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>«</button>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹</button>
        {/*totalPages: 총 페이지 수
          value는 underfined 이고, 필요 없기 때문에 _로 무시하고,
          index는 실제로 쓰이니까 i로 받는 거임.
        */}
        {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
          <button
            key={page}
            className={page === currentPage ? styles.activePage : ''}
            onClick={() => setCurrentPage(page)}
          >
            {page}
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
