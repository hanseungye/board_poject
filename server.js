require("dotenv").config();
const express = require("express");
const cors = require('cors');
const app = express();
const server = require('http').createServer(app);  
const nodemailer = require("nodemailer");
const pool = require('./src/db/db'); 
const bcrypt = require("bcrypt");

const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);
// 미들웨어
app.use(cors());
app.use(express.json());

// Nodemailer 설정
const transporter = nodemailer.createTransport({
  host: "smtp.naver.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.get('/users', async (req, res) => {
  try {
    const result = await sql`SELECT * FROM users`;
    res.json(result);  // 또는 res.json({ rows: result }) 등
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 이메일 인증용 임시 저장소
const codes = {};

// ✅ POST /email: 인증 코드 전송
app.post("/email", async (req, res) => {
  try {
    // 여기! POST니까 body에서 email 받음
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "이메일을 다시 입력해주세요." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "올바른 이메일을 입력해주세요." });
    }

    // 인증 코드 생성 및 저장
    const authCode = Math.floor(100000 + Math.random() * 900000);
    codes[email] = authCode;

    const mailOption = {
      from: `"이메일 인증" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "이메일 인증 코드",
      text: `인증코드는 [${authCode}] 입니다.`
    };

    await transporter.sendMail(mailOption);

    console.log(`✅ 인증 코드 [${authCode}] → ${email}`);

    res.status(200).json({ message: "이메일 전송 성공", code: authCode });
  } catch (error) {
    console.error("❌ 메일 전송 실패:", error);
    res.status(500).json({ error: "이메일 전송 실패" });
  }
});

// ✅ POST /verify: 인증 코드 검증
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
// 회원가입 처리 로직

app.post("/users/register", async (req, res) => {
  const { id, password, name, gender, email } = req.body;
  try {
    // 1. 비밀번호 해싱
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. 유저 삽입
    const insertResult = await sql`
      INSERT INTO users (id, password, name, gender, email)
      VALUES (${id}, ${hashedPassword}, ${name}, ${gender}, ${email})
      RETURNING *;
    `;

    const insertedUser = insertResult[0];

    // 3. role 업데이트 (role이 비어있으면)
    let updatedUser = insertedUser;
    if (!insertedUser.role || insertedUser.role === '') {
      const updateResult = await sql`
        UPDATE users
        SET role = 'user'
        WHERE (role IS NULL OR role = '')
          AND id = ${insertedUser.id}
        RETURNING *;
      `;
      if (updateResult.length > 0) {
        updatedUser = updateResult[0];
      }
    }

    res.status(201).json({ message: "회원가입 성공!", user: updatedUser });
  } catch (err) {
    console.error("회원가입 오류", err);
    res.status(500).json({ error: "회원가입 실패!" });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`서버 실행 중: http://0.0.0.0:${PORT}`);
});
