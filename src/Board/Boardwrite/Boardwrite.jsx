import React, { useState } from 'react';
import styles from './Write.module.css';
import axios from 'axios';

function Write() {
  const [Title, setTitle] = useState('');
  const [Content, setContent] = useState('');
  const [File, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!Title || !Content) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/notices",
        { Title, Content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const noticeid = response.data.notice.id; // DB에서 응답받은 id

      if (File) {
        const formData = new FormData();
        formData.append("file", File);
        formData.append("notice_id",noticeid); // db에서 받은 noticeid..

        const response2 = await axios.post(
          "http://localhost:5000/notices/file",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          }
        );
        if(response2.status === 200){
          console.log(" 파일 업로드 성공:", response2.data);
        } else{
          console.error("✅ 파일 업로드 실패 또는 이상 응답:");
        }
      }

      alert("공지사항이 성공적으로 등록되었습니다.");

    } catch (e) {
      console.error("❌ 데이터 전송 실패:", e.response?.data || e.message);
      alert("데이터 전송 실패");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h4 className={styles.boardLabel}>공지사항</h4>
        <h2 className={styles.heading}>보고서 작성 페이지</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>제목</label>
            <input
              type="text"
              className={styles.input}
              placeholder="제목을 입력하세요"
              value={Title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>내용</label>
            <textarea
              className={styles.textarea}
              rows="10"
              placeholder="내용을 입력하세요"
              value={Content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>첨부 파일(전체 공지사항으로 올릴 시 파일 첨부는 하지 말아주세요.)</label>
            <input
              type="file"
              className={styles.fileInput}
              onChange={handleFileChange}
            />
            <p className={styles.fileInfo}>
              {File ? `선택한 파일: ${File.name}` : "선택한 파일이 없습니다."}
            </p>
          </div>

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.primaryBtn}>전송</button>
            <button type="button" className={styles.secondaryBtn}>목록</button>
            <button type="button" className={styles.secondaryBtn}>상세보기</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Write;
