import '../App';
import styles from './Main.module.css';
import { useNavigate } from 'react-router-dom';
import Login from "./Login_page/Login";
import { TbReportAnalytics } from "react-icons/tb";
// 이미지 import 필요 없음 (CSS에서 background-image로 처리할 거라면 이 줄 삭제 가능)

function Main({ isLoggedIn }) {
  const navigate = useNavigate();
  const handle_Login = () => navigate("/login");
  const handle_Announcement1 = () => navigate("/board");
  const handle_Announcement2 = () => navigate("/report");

  return (
    <div className={styles.grid}>
      {/* 🔒 잠금 배너 배경 (이미지를 배경으로 설정) */}
      <div className={styles.lockBanner}></div>

      {/* 로그인 컴포넌트 */}
      <Login handle_Login={handle_Login} isLoggedIn={isLoggedIn} />

      {/* 대시보드 */}
      <div className={styles.dashboardContainer}>
        <div onClick={handle_Announcement1}>
          <TbReportAnalytics size={54} color="#1d3d8f" style={{ marginBottom: "10px" }} />
          <h3>보고서 제출</h3>
          <p>학생들은 각 주차별 보고서를 간편하게 제출하고, 진행 사항을 확인할 수 있다.</p>
        </div>
        <div onClick={handle_Announcement2}>
          <TbReportAnalytics size={54} color="#28a0e5" style={{ marginBottom: "10px" }} />
          <h3>전체 공지사항</h3>
          <p>중요한 공지사항과 업데이트 정보를 한눈에 확인할 수 있다.</p>
        </div>
      </div>
      {/* 푸터 */}
      {/* 푸터 */}
      <footer className={styles.footer}>
        <p>📍 PS 동아리 S104호 | 이메일: <a href="mailto:comhhj1127@gmail.com">comhhj1127@gmail.com</a></p>
        <p>👨‍🏫 지도 교수: 함형민</p>
        <p>👥 부원: 한승연, 서영석, 김별빛, 차현우, 조한결, 김종윤, 이나연</p>
      </footer>

    </div>
  );
}

export default Main;
