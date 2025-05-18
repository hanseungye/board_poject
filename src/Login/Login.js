import React, { useState } from 'react'
import styles from './Login.module.css'
import {Link} from 'react-router-dom';

function Login() {
  const [role, setRole] = useState('교수');

  return (
    <div className={styles.grid}>
      {/* 로그인 설명 */}
      <div className={styles.login_text}>
        <h1>로그인</h1>
        <p>계정에 로그인해주시길 바랍니다.</p>
      </div>

      {/* 로그인 박스 */}
      <div className={styles.login_box}>
        <div className={styles.student}>
          <button
            className={`${styles.role_button} ${
              role === '교수' ? styles.active : ''
            }`}
            onClick={() => setRole('교수')}
          >
            교수
          </button>
          <button
            className={`${styles.role_button} ${
              role === '학생' ? styles.active : ''
            }`}
            onClick={() => setRole('학생')}
          >
            학생
          </button>
        </div>

        <div className={styles.email}>
          <label htmlFor="email">이메일</label>
          <input
            id="email"
            type="email"
            placeholder="example@domain.com"
          />
        </div>

        <div className={styles.password_box}>
          <div className={styles.password}>
            <label htmlFor="password">비밀번호</label>
          </div>
          <input
            id="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
          />
          <button className={styles.login_button}>로그인</button>
        </div>

        <p className={styles.signup_text}>
          계정이 없으신가요? <Link to ="/membership">가입하세요.</Link>
        </p>
      </div>
    </div>
  )
}

export default Login;
