import styles from '../Main.module.css';

function Login({ handle_Login }) {
    return (
        <div className={styles.reportHeader}>
            <h1>주차별 보고서 관리 시스템</h1>
            <p>학생들의 주차별 보고서를 효율적으로 관리하고 피드백을 제공하는 플랫폼입니다.</p>
            <div className={styles.login}>
                <button onClick={handle_Login}>로그인</button>
                <button>자세히 알아보기</button>
            </div>
        </div>
    );
}
export default Login;