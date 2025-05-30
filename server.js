require("dotenv").config();
const express = require("express");
const cors = require('cors');
const app = express();
const server = require('http').createServer(app);  
const nodemailer = require("nodemailer");
const pool = require('./src/db/db'); 
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

// 미들웨어
app.use(cors({
  origin: [
    "https://ps-board.netlify.app",
    "http://localhost:3000"
  ],
  credentials: true
}));

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
const codes = {}; // ✅ 인증 유효시간을 위한 구조로 수정
// codes[email] = { code: 123456, expiresAt: 123456789 }

app.post("/email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "이메일을 다시 입력해주세요." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "올바른 이메일을 입력해주세요." });
    }

    const authCode = Math.floor(100000 + Math.random() * 900000);
    codes[email] = {
      code: authCode,
      expiresAt: Date.now() + 5 * 60 * 1000 // ✅ 인증 코드 5분 유효시간 추가
    };

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

app.post("/verify", (req, res) => {
  const { email_check, email } = req.body;
  try {
    if (!email || !email_check) {
      return res.status(400).json({ message: "이메일 또는 코드 없음" });
    }

    const record = codes[email];
    if (
      record &&
      record.code === Number(email_check) &&
      Date.now() <= record.expiresAt // ✅ 유효시간 체크
    ) {
      return res.status(200).json({ message: "인증 성공" });
    } else {
      return res.status(400).json({ message: "인증 실패. 코드가 만료되었거나 일치하지 않습니다." }); // ✅ 메시지 통일
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
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const emailResult = await sql`
      SELECT * FROM users WHERE email = ${email};
    `;
    if (emailResult.length > 0){
      return res.status(409).json({message:"이미 가입된 이메일 입니다."});
    } 

    const idResult = await sql`
      SELECT * FROM users WHERE id = ${id};
    `;
    if(idResult.length > 0){
      return res.status(403).json({message:"아이디가 중복 되었습니다."});
    }

    const insertResult = await sql`
      INSERT INTO users (id, password, name, gender, email)
      VALUES (${id}, ${hashedPassword}, ${name}, ${gender}, ${email})
      RETURNING *;
    `;

    const insertedUser = insertResult[0];

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

// 로그인 로직
app.post("/users/login/student", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "이메일과 비밀번호를 모두 입력해주세요." }); // ✅ return 추가
    }

    const userResult = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    const user = userResult[0];

    if (!user || user.role !== "user") {
      return res.status(403).json({ message: "관리자 계정 입니다. 학생 계정 왼쪽에 교수 버튼 클릭해서 로그인 해주시길 바랍니다." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "이메일이나 비밀번호가 틀렸습니다. 다시 입력해주세요." });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        gender: user.gender,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "ok", token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (error) {
    res.status(500).json({ message: "로그인 오류", error: error.message });
  }
});

app.post("/users/login/professor", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "이메일과 비밀번호를 모두 입력해주세요." }); // ✅ return 추가
    }

    const userResult = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    const user = userResult[0];

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "관리자 계정이 아니거나 회원등록이 안 되어 있습니다. 가입 부탁 드립니다." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "이메일 또는 비밀번호가 일치하지 않습니다." });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        gender: user.gender,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "ok", token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (err) {
    console.error("로그인 오류:", err);
    res.status(500).json({ message: "서버 내부 오류", error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`서버 실행 중: http://0.0.0.0:${PORT}`);
});
