import React, { useState, useEffect } from 'react';
import styles from './Write.module.css';
import axios from 'axios';

function Write() {
  const [Title, setTitle] = useState("");
  const [Content, setContent] = useState("");
  const [File, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]; // ✅ 여기서도 File → files 고침
    setFile(selectedFile);
  };
  // node.js 서버로 전송
  // 경로를 만들어주면 될 듯
  // /api/notices =>  제목과 내용을 저장하는 경로.
  // /api/notices/file => 파일을 저장하는 node.js 경로
  // Title 이랑 Content File이 존재하지 않으면 입력해주세요.
  const handleSubmit = async (e) => { // node.js로 전송하는 코드/
    e.preventDefault(); // 불필요한 이벤트 방지.
    if (!Title || !Content) { // title이 존재하지 않거나 내용이 존재하지 않으면
      alert("title 이나 내용을 입력해주세요.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/notices",
        { Title, Content },
        { headers: { 'Content-Type': 'application/json' } }
      );
      let data = response.data
      console.log("서버로부터 데이터를 성공적으로 받아왔습니다.", data);
      if (File) {
        let formData = new FormData();
        formData.append("file",File);
        const response2 = await axios.post(
         "http://localhost:5000/notices/file",
         formData,
         {
          headers: {
            "Content-Type": "multipart/form-data",
          },
         }
        );
        const data2 = response.data;
        if(data2){
          alert("데이터를 성공적으로 불러왔습니다.");
          console.log(`파일을 성공적으로 불러왔습니다. ${JSON.stringify(data2)}`);
        }
      }
    } catch (e) {
      alert("데이터 전송 실패");
      console.error("데이터 전송 실패.", e);
    }

  }
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h4 className={styles.boardLabel}>공지사항</h4>
        <h2 className={styles.heading}>새 글쓰기</h2>

        {/* ✅ form으로 전체 묶기 */}
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
            <label className={styles.label}>첨부 파일</label>
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
