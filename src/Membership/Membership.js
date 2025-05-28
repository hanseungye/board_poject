import styles from './Membership.module.css';
import React, { useState } from 'react';
import axios from 'axios';

function Membership() {
  const [id, setId] = useState(""); // 사용자 ID 입력 값
  const [password, setPassword] = useState(""); // 사용자 비밀번호 입력 값
  const [password_check, setPassword_check] = useState(""); // 비밀번호 재확인 입력 값
  const [name, setName] = useState(""); // 사용자 이름 입력 값
  const [gender, setGender] = useState(""); // 사용자 성별 선택 값
  const [email, setEmail] = useState(""); // 사용자 이메일 입력 값
  const [email_check, setemail_check] = useState(""); // 이메일 인증번호 입력 값
  const [password_bolean, setPassword_bolean] = useState(false); //비밀번호와 재확인이 일치하는지 여부(일치하면 true)
  const [isEmailVerified, setIsEmailVerified] = useState(false); // 이메일 인증 성공 여부(true면 인증 완료된 상태)
  const [verificationMessage, setVerificationMessage] = useState(""); // 이메일 인증 상태나 안내 메시지 출력용 문자열

  const url = process.env.REACT_APP_API_URL;
  console.log("API URL:", url);
  const onValidMail = async () => {
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
      console.log("이메일 요청:", response.data);
      setVerificationMessage("인증번호가 발송되었습니다. 이메일을 확인하세요.");
    } catch (e) {
      if(e.response && e.response?.status === 409){
        alert(e.response?.data.message);
      } if(e.response && e.response?.status === 403){
        alert(e.response?.data.message);
      }
      console.error(e);
      setVerificationMessage("이메일 인증 요청에 실패했습니다.");
    }
  };

  const onValid_check_Mail = async () => {
    if (!email_check || !email_check.trim()) {
      alert("이메일 인증 번호를 입력하세요:");
      return;
    }

    try {
      const response = await axios.post(`${url}/verify`, {
        email_check: email_check,
        email: email
      });
      console.log("인증 결과:", response.data);
      alert("인증에 성공하셨습니다.");
      setIsEmailVerified(true);
      setVerificationMessage("");
    } catch (error) {
      console.error(error);
    }
  };

  const Password = (e) => {
    const value = e.target.value;
    setPassword_check(value);
    setPassword_bolean(password === value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = {
      "id": id,
      "pw": password,
      "pw_check": password_check,
      "name": name,
      "gender": gender,
      "email": email,
      "email_check": email_check,
    };

    for (let [key, value] of Object.entries(requiredFields)) {
      if (!value || !value.trim()) {
        alert(`${key}를 입력하세요.`);
        return;
      }
    }

    if (!password_bolean) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!isEmailVerified) {
      alert("이메일 인증을 완료해주세요.");
      return;
    }

    let allFilled = true;
    for (let key in requiredFields) {
      if (!requiredFields[key]) {
        allFilled = false;
        break;
      }
    }
    try {
      if (allFilled) {
        // 모든 조건이 true 일 때 실행.
        const response = await axios.post(`${url}/users/register`,{  
          id,
          password,
          name,
          gender,
          email
        });
        console.log("데이터 전송 성공",response.data);
        alert("회원가입을 완료했습니다.");
      }
    } catch (error) {
      console.error("인증 실패:", error.response?.data || error.message);
      alert("인증에 실패했습니다.");
      setIsEmailVerified(false);
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
            type='text'
            id="id"
            placeholder="ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />

          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label htmlFor="password_check">비밀번호 재확인</label>
          <div className={styles.input_wrapper}>
            <span className={styles.icon_right}>
              {password_bolean ? '✅' : '❌'}
            </span>
            <input
              type="password"
              id="password_check"
              value={password_check}
              onChange={Password}
              placeholder="비밀번호 재입력"
              className={styles.input_with_icon}
            />
          </div>

          <label htmlFor="name">이름</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div>
            <label htmlFor="gender">성별</label>
            <select
              id="gender"
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
              type="email"
              placeholder="example@domain.com"
              className={styles.email_code_input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="button"
              className={styles.verify_button}
              onClick={onValidMail}
            >
              입력
            </button>
          </div>

          <label htmlFor="email_code">이메일 인증번호 입력</label>
          <div className={styles.email_verify_row}>
            <input
              id="email_code"
              type="text"
              placeholder="인증번호 입력"
              value={email_check}
              onChange={(e) => setemail_check(e.target.value)}
              className={styles.email_code_input}
            />
            <button
              type="button"
              className={styles.verify_button}
              onClick={onValid_check_Mail}
            >
              인증번호 요청
            </button>
          </div>
          <button
            type="submit"
            className={styles.signup_button}
            onClick={handleSubmit}
          >
            가입하기
          </button>
        </form>
      </div>
    </div>
  );
}

export default Membership;
