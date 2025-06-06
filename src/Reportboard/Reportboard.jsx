import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Reportboard.module.css";



function Reportboard() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const url = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const [report, setReport] = useState(location.state?.boards?.find(b => b.id === Number(id)) || null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`${url}/board/${id}`);
        setReport(res.data);
      } catch (err) {
        console.error("게시글 불러오기 실패:", err);
      }
    };

    if (!report) fetchReport();
    // eslint-disable-next-line
  }, [id, report]);

  if (!report) return <div>로딩 중...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.category}>공지</div>

      <h1 className={styles.title}>{report.title}</h1>

      <div className={styles.subInfo}>
        <span>{new Date(report.created_at).toLocaleDateString()}</span>
        <span className={styles.views}>조회수 {report.views_count}</span>
      </div>

      <hr className={styles.divider} />

      <div className={styles.content}>
        {report.content}
      </div>

      <div className={styles.backBtnWrapper}>
        <button className={styles.backBtn} onClick={() => navigate("/report")}>
          ← 목록으로
        </button>
      </div>
    </div>
  );
}

export default Reportboard;
