require("dotenv").config();
const express = require("express");
const cors = require('cors');
const app = express();
const server = require('http').createServer(app);  
const nodemailer = require("nodemailer");
const pool = require('./src/db/db'); 
const bcrypt = require("bcrypt");

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

// ✅ GET /users: users 테이블 전체 조회
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
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
app.post("/users/register",async(req,res)=>{
  const {id,password,name,gender,email} = req.body;
  try{
    // 1. 비밀번호 해싱(암호화)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password,saltRounds);

    const sql = `
    INSERT INTO users (id,password,name,gender,email) 
    VALUES ($1,$2,$3,$4,$5) RETURNING *`;
    const result = await pool.query(sql,[id,hashedPassword,name,gender,email]);
    
    const insertedId = result.rows[0].id; // 삽입된 유저의 id
    console.log("Inserted user:",result.rows[0]);
    // 2. 만약 'role'이 비어 있다면, role = "GM"으로 업데이트
    // (role 컬럼이 NULL 이거나 '' 일 때만 업데이트)
    //  여기서는, 삽입 직후 role이 비어 있다면 바로 업데이트
    const updateSql = `
    UPDATE users 
    SET role = 'user'
    WHERE (role IS NULL OR role = '')
     AND id = $1
     RETURNING *;
    `;
    const updateResult = await pool.query(updateSql,[insertedId]);
    console.log("Role updated:",updateResult.rows[0]);

    return res.status(201).json({message:"회원가입 성공!",user:result.rows[0]});
  } catch(err){
    console.error("회원가입 오류",err);
    res.status(500).json({error:"회원가입 실패!"});
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`서버 실행 중: http://0.0.0.0:${PORT}`);
});
