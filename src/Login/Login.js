import React, { useState } from 'react';
import styles from './Login.module.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import RoleSelector from './components/RoleSelector';// ❗ 폴더 경로 확인
import LoginForm from './components/LoginForm';

function Login() {
  // 상태 관리
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('교수');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const url = process.env.REACT_APP_API_URL;

  // 로그인 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert('이메일과 비밀번호를 입력하세요.');
      return;
    }

    try {
      const loginUrl =
        role === '교수'
          ? `${url}/users/login/professor`
          : `${url}/users/login/student`;

      const response = await axios.post(
        loginUrl,
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const { token, user } = response.data;

      // 저장
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      queryClient.setQueryData(['auth', 'token'], token);
      queryClient.setQueryData(['auth', 'user'], user);

      alert('로그인 성공! 메인 페이지로 이동합니다.');
      navigate('/main');
    } catch (err) {
      console.error(err);
      alert('로그인 실패');
    }
  };

  return (
    <div className={styles.grid}>
      {/* 로그인 설명 */}
      <div className={styles.login_text}>
        <h1>로그인</h1>
        <p>계정에 로그인해주시길 바랍니다.</p>
      </div>

      {/* 로그인 박스 */}
      <div className={styles.login_box}>
        {/*교수 학생 버튼 컴포넌트*/}
        <RoleSelector 
          role={role} 
          setRole={setRole} 
        />
        {/*이메일 비밀번호 로그인 컴포넌트*/}
        <LoginForm 
          email = {email} 
          setEmail={setEmail} 
          password={password} 
          setPassword={setPassword}
          handleSubmit={handleSubmit}
        />
        <p className={styles.signup_text}>
          계정이 없으신가요? <Link to="/membership">가입하세요.</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
