import styles from '../Main.module.css';
import React, { useState, useEffect } from 'react';
function Login({ handle_Login, isLoggedIn }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);
    return (
        <div className={styles.reportHeader}>
            {isLoggedIn && user ? (
                <div>
                    <span>{user.role === "admin" ? "관리자": "일반회원"} {user.name}님 환영합니다!</span>
                </div>
            ) : (
                <span>로그인이 필요합니다.</span>
            )}
            <h1>주차별 보고서 관리 시스템</h1>
            <p>학생들의 주차별 보고서를 효율적으로 관리하고 피드백을 제공하는 플랫폼입니다.</p>
            <div className={styles.login}>
                {isLoggedIn ? (
                    <button>자세히 알아보기</button>
                ) : (
                    <div className={styles.button}>
                        <button onClick={handle_Login}>로그인</button>
                        <button>자세히 알아보기</button>
                    </div>
                )}
            </div>

        </div>
    );
}
export default Login;