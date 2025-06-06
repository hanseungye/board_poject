import React, { useState } from 'react';
import styles from './ReportWrite.module.css';
import axios from 'axios';


function ReportWrite() {
  // url 상수로 분리 (환경 변수 활용)
  const url = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      const response = await axios.post(`${url}/board/write`, {
        title,
        content
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("작성된 글:", response.data);
      alert("글이 성공적으로 작성되었습니다!");

      // 초기화
      setTitle('');
      setContent('');
    } catch (err) {
      console.error("등록 중 오류 발생:", err);
      alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <p className={styles.label}>공지사항</p>
      <h1 className={styles.heading}>보고서 작성 페이지</h1>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.formLabel}>제목</label>
          <input
            id="title"
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="content" className={styles.formLabel}>내용</label>
          <textarea
            id="content"
            placeholder="내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className={styles.textarea}
          />
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading}
        >
          {loading ? '작성 중...' : '작성 완료'}
        </button>
      </form>
    </div>
  );
}

export default ReportWrite;
