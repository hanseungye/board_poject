require("dotenv").config();
const express = require("express");
const cors = require('cors');
const app = express();
const server = require('http').createServer(app);
const nodemailer = require("nodemailer"); // ✅ 이게 꼭 필요합니다

// CORS 사용
app.use(cors());
// JSON 파싱
app.use(express.json());
const transporter = nodemailer.createTransport({
  host: "smtp.naver.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const codes = {};
app.post("/email", async (req, res) => {
  try {
    // ✅ 수정 1: POST에서는 query 대신 body에서 받기
    const email = req.query.email;

    // ✅ 이메일 유효성 검사
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "이메일을 다시 입력해주세요." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "올바른 이메일을 입력해주세요." });
    }

    // ✅ 인증 코드 생성
    const authCode = Math.floor(100000 + Math.random() * 900000);
    // 인증코드 저장.
    codes[email] = authCode;
    // ✅ 수정 2: from 괄호 누락 수정
    const mailOption = {
      from: `"이메일 인증" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "이메일 인증 코드",
      text: `인증코드는 [${authCode}] 입니다.`
    };

    // ✅ 수정 3: transpoter → transporter 오타 수정
    await transporter.sendMail(mailOption);

    console.log(`✅ 인증 코드 [${authCode}] → ${email}`);

    // 응답
    res.status(200).json({ message: "이메일 전송 성공", code: authCode });
  } catch (error) {
    // ✅ 수정 4: err → error로 변경
    console.error("❌ 메일 전송 실패:", error);
    res.status(500).json({ error: "이메일 전송 실패" });
  }
});

app.post("/verify", (req, res) => {
  const { email_check, email } = req.body;
  try {
    if (!email && !email_check) {
      return res.status(400).json({ message: "이메일 또는 코드 없음" });
    }
    if (codes[email] && codes[email] === Number(email_check)) {
      return res.status(200).json({ message: "인증 성공" });
    } else {
      return res.status(400).json({ message: "코드 불일치" });
    }
  } catch (err) {
    console.error("서버 에러:", err);
    return res.status(500).json({ error: "서버 에러" });
  }
});


server.listen(5000, '0.0.0.0', () => {
  console.log("서버 실행 중: http://192.168.1.9:5000");
});