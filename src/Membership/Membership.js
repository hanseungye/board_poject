import styles from './Membership.module.css';
import React, { useState } from 'react';
import axios from 'axios';

function Membership() {
  // 상태 변수
  const [id, setId] = useState(""); // 사용자 ID 입력 값
  const [password, setPassword] = useState(""); // 비밀번호
  const [passwordCheck, setPasswordCheck] = useState(""); // 비밀번호 재확인
  const [name, setName] = useState(""); // 이름
  const [gender, setGender] = useState(""); // 성별
  const [email, setEmail] = useState(""); // 이메일
  const [emailCheck, setEmailCheck] = useState(""); // 이메일 인증번호
  const [isPasswordMatch, setIsPasswordMatch] = useState(false); // 비번 일치 여부
  const [isEmailVerified, setIsEmailVerified] = useState(false); // 이메일 인증 여부
  const [verificationMessage, setVerificationMessage] = useState(""); // 인증 안내 메시지

  // 환경변수에서 API URL 읽기 (없을 땐 기본값)
  const url = process.env.REACT_APP_API_URL || "http://localhost:5000";
  // console.log("API URL:", url);

  // 비밀번호 입력 변경 핸들러
  const handlePassword = (e) => {
    const value = e.target.value;
    setPassword(value);
    setIsPasswordMatch(value === passwordCheck);
  };

  // 비밀번호 재확인 입력 변경 핸들러
  const handlePasswordCheck = (e) => {
    const value = e.target.value;
    setPasswordCheck(value);
    setIsPasswordMatch(password === value);
  };

  // 이메일 인증 요청
  const handleSendVerificationCode = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }
    if (!emailRegex.test(email)) {
      alert("올바른 이메일 형식이 아닙니다.");
      return;
    }
    try {
      const response = await axios.post(`${url}/email?email=${email}`, { email });
      // console.log("이메일 요청:", response.data);
      setVerificationMessage("인증번호가 발송되었습니다. 이메일을 확인하세요.");
    } catch (error) {
      if (error.response && (error.response.status === 409 || error.response.status === 403)) {
        alert(error.response.data.message);
      }
      setVerificationMessage("이메일 인증 요청에 실패했습니다.");
      // console.error(error);
    }
  };

  // 이메일 인증번호 확인
  const handleVerifyCode = async () => {
    if (!emailCheck || !emailCheck.trim()) {
      alert("이메일 인증 번호를 입력하세요:");
      return;
    }
    try {
      const response = await axios.post(`${url}/verify`, {
        email_check: emailCheck,
        email: email,
      });
      // console.log("인증 결과:", response.data);
      alert("인증에 성공하셨습니다.");
      setIsEmailVerified(true);
      setVerificationMessage("");
    } catch (error) {
      setVerificationMessage("이메일 인증에 실패했습니다.");
      // console.error(error);
    }
  };

  // 회원가입 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필수 입력값 확인
    const requiredFields = {
      id,
      password,
      passwordCheck,
      name,
      gender,
      email,
      emailCheck,
    };

    for (let [key, value] of Object.entries(requiredFields)) {
      if (!value || !value.trim()) {
        alert(`${key}를 입력하세요.`);
        return;
      }
    }

    if (!isPasswordMatch) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!isEmailVerified) {
      alert("이메일 인증을 완료해주세요.");
      return;
    }

    try {
      const response = await axios.post(`${url}/users/register`, {
        id,
        password,
        name,
        gender,
        email,
      });
      // console.log("데이터 전송 성공", response.data);
      alert("회원가입을 완료했습니다.");
      // 가입 완료 후 폼 초기화 및 이메일 인증 리셋
      setId(""); setPassword(""); setPasswordCheck(""); setName("");
      setGender(""); setEmail(""); setEmailCheck("");
      setIsPasswordMatch(false); setIsEmailVerified(false);
    } catch (error) {
      alert(error.response?.data?.message || "회원가입에 실패했습니다.");
      setIsEmailVerified(false);
      // console.error("회원가입 실패:", error.response?.data || error.message);
    }
  };

  return (
    <div>
      <h1>회원가입</h1>
      <div className={styles.id_input}>
        {!isEmailVerified && verificationMessage && (
          <p style={{ color: 'orange', textAlign: 'center' }}>{verificationMessage}</p>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="id">아이디</label>
          <input
            type="text"
            id="id"
            name="id"
            placeholder="ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />

          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={handlePassword}
          />

          <label htmlFor="passwordCheck">비밀번호 재확인</label>
          <div className={styles.input_wrapper}>
            <span className={styles.icon_right}>
              {isPasswordMatch ? '✅' : '❌'}
            </span>
            <input
              type="password"
              id="passwordCheck"
              name="passwordCheck"
              value={passwordCheck}
              onChange={handlePasswordCheck}
              placeholder="비밀번호 재입력"
              className={styles.input_with_icon}
            />
          </div>

          <label htmlFor="name">이름</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div>
            <label htmlFor="gender">성별</label>
            <select
              id="gender"
              name="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">선택</option>
              <option value="남자">남자</option>
              <option value="여자">여자</option>
            </select>
          </div>

          <label htmlFor="email">이메일</label>
          <div className={styles.email_verify_row}>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="example@domain.com"
              className={styles.email_code_input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="button"
              className={styles.verify_button}
              onClick={handleSendVerificationCode}
            >
              인증번호 요청
            </button>
          </div>

          <label htmlFor="email_code">이메일 인증번호 입력</label>
          <div className={styles.email_verify_row}>
            <input
              id="email_code"
              name="emailCheck"
              type="text"
              placeholder="인증번호 입력"
              value={emailCheck}
              onChange={(e) => setEmailCheck(e.target.value)}
              className={styles.email_code_input}
            />
            <button
              type="button"
              className={styles.verify_button}
              onClick={handleVerifyCode}
            >
              인증
            </button>
          </div>

          <button
            type="submit"
            className={styles.signup_button}
          >
            가입하기
          </button>
        </form>
      </div>
    </div>
  );
}

export default Membership;
