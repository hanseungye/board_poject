import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import styles from "./NoticeDetail.module.css";

function NoticeDetail() {
  const location = useLocation();
  const passedNotice = location.state?.notice;
  const { id } = useParams();
  const navigate = useNavigate();

  const [notice, setNotice] = useState(passedNotice || null);
  const [filename, setFilename] = useState(null); // ✅ 첨부파일 상태

  useEffect(() => {
    console.log("내용 확인:",notice);
    const fetchNotice = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/notices/${id}`);
        setNotice(res.data);
      } catch (err) {
        console.error("공지사항 불러오기 실패:", err);
      }
    };

    const fetchFile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/notices/files/${id}`);
        if (res.data.files.length > 0) {
          setFilename(res.data.files[0].filename);
        }
      } catch (err) {
        console.error("파일 불러오기 실패:", err);
      }
    };

    const increaseViews = async () => {
      try {
        await axios.patch(`http://localhost:5000/notices/${id}/views`);
      } catch (err) {
        console.error("조회수 증가 실패:", err);
      }
    };

    if (!passedNotice) fetchNotice();
    fetchFile();
    increaseViews();
  }, [id, passedNotice]);

  if (!notice) return <div className={styles.loading}>로딩 중...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.category}>공지</div>

      <h1 className={styles.title}>{notice.title}</h1>

      <div className={styles.subInfo}>
        <span>{new Date(notice.created_at).toLocaleDateString()}</span>
        <span className={styles.views}>조회수 {notice.views_count}</span>
      </div>

      <hr className={styles.divider} />

      <div className={styles.content}>
        {notice.content}
        {filename && (
          <div className={styles.fileSection}>
            첨부파일:{" "}
            <a
              href={`http://localhost:5000/download/${encodeURIComponent(filename)}`}
              download
              className={styles.fileLink}
            >
              {filename}
            </a>
          </div>
        )}
      </div>

      <div className={styles.backBtnWrapper}>
        <button className={styles.backBtn} onClick={() => navigate("/board")}>
          ← 목록으로
        </button>
      </div>
    </div>
  );
}

export default NoticeDetail;
