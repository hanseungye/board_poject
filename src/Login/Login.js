import React, { useState } from 'react';
import styles from './Login.module.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { useQueryClient } from '@tanstack/react-query';

function Login() {
  // 이메일, 역할, 비밀번호 상태
  const [email, setEmail] = useState("");
  const [role, setRole] = useState('교수');
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const url = process.env.REACT_APP_API_URL;
  // 로그인 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    // 이메일, 비밀번호 입력 체크
    if (!email.trim() || !password.trim()) {
      alert('이메일과 비밀번호를 입력하세요.');
      return;
    }
    try {
      // API 주소 역할별로 구분
      const localhost_url = role === "교수"
        ? `${url}/users/login/professor`
        : `${url}/users/login/student`;
      console.log(localhost_url);
      // 서버로 로그인 요청
      const response = await axios.post(localhost_url, { email, password }, {
        headers: { 'Content-Type': 'application/json' }
      });
      const { token, user } = response.data;

      // 1. LocalStorage에 저장
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      // 2. react-query 캐시에 저장 
      queryClient.setQueryData(['auth', 'token'], token);
      queryClient.setQueryData(['auth', 'user'], user);

      alert("로그인 성공! 메인 페이지로 이동합니다.");
      navigate('/main');
      console.log(`데이터 전송 성공: ${JSON.stringify(response.data)}`);
    } catch (e) {
      console.error(e);
      alert("로그인 실패");
    }
  }

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
            className={`${styles.role_button} ${role === '교수' ? styles.active : ''}`}
            onClick={() => setRole('교수')}
          >
            교수
          </button>
          <button
            className={`${styles.role_button} ${role === '학생' ? styles.active : ''}`}
            onClick={() => setRole('학생')}
          >
            학생
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.email}>
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              placeholder="example@domain.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button className={styles.login_button}>로그인</button>
          </div>
        </form>
        <p className={styles.signup_text}>
          계정이 없으신가요? <Link to="/membership">가입하세요.</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
