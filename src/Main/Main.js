import '../App';
import styles from './Main.module.css'
import { useNavigate } from 'react-router-dom';
// 로그인 버튼 누르면 link 이동
function Main() {
  const navigate = useNavigate();
  const handle_Login = () => {
    navigate("/login");
  }
  return (
    /*제목 부분*/
    <div className={styles.grid}>
      <div className={styles.reportHeader}>
        <h1>주차별 보고서 관리 시스템</h1>
        <p>학생들의 주차별 보고서를 효율적으로 관리하고 피드백을 제공하는 플랫폼입니다.</p>
        <div className={styles.login}>
          <button onClick={handle_Login}>로그인</button>
          <button>자세히 알아보기</button>
        </div>
      </div>
      {/*전체 공지사항, 보고서 제출, 최신 IT 블로그 모음. 메뉴 구성*/}
      <div className={styles.dashboardContainer}> {/*컨테이너 박스*/}
        <div>
          <p>아이콘</p>
          <h3>전체 공지사항</h3>
          <p>중요한 공지사항과 업데이트 정보를 한눈에 확인할 수 있다.</p>
        </div>
        <div>
          <p>아이콘</p>
          <h3>보고서 제출</h3>
          <p>학생들은 각 주차별 보고서를 간편하게 제출하고 진행 사항을 확인할 수 있다.</p>
        </div>
        <div>
          <p>아이콘</p>
          <h3>최신 IT 블로그 모음</h3>
          <p>최신 기술 트렌드와 개발 정보를 담은 IT 블로그 글을 모아 제공합니다.</p>
        </div>
      </div>
    </div>
  );
}

export default Main;