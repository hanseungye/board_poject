import '../App';
import styles from './Main.module.css'
import { useNavigate } from 'react-router-dom';
import Login from "./Login_page/Login"
// 로그인 버튼 누르면 link 이동
function Main() {
  const navigate = useNavigate();
  const handle_Login = () => {
    navigate("/login"); 
  }
  return (
    /*제목 부분*/
    <div className={styles.grid}>
      {/*로그인 컴포넌트*/}
      <Login
        handle_Login = {handle_Login}
      />
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