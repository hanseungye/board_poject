require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const server = require("http").createServer(app);
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { neon } = require("@neondatabase/serverless");
const sanitize = require("sanitize-filename");

const sql = neon(process.env.DATABASE_URL);

// 미들웨어
app.use(cors({
  origin: ["https://ps-board.netlify.app", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json());

// 파일 저장 폴더 설정
const uploadDir = path.join(__dirname, "files");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

app.use("/files", express.static(path.join(__dirname, "files")));
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const basename = path.parse(file.originalname).name;
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now();
    const finalName = `${basename}-${uniqueSuffix}${ext}`; // ✅ 그 다음에 사용
    cb(null, finalName); // 최종 파일 이름을 저장
  },
});

const upload = multer({ storage });
// ✅ 서버
app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, "files", filename);

  if (!fs.existsSync(filepath)) {
    return res.status(404).send("파일이 존재하지 않습니다.");
  }

  res.download(filepath, filename, (err) => {
    if (err) {
      console.error("파일 다운로드 오류:", err);
      res.status(500).send("파일 다운로드 실패");
    }
  });
});

// 이메일 전송 설정
const transporter = nodemailer.createTransport({
  host: "smtp.naver.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const codes = {};

// JWT 인증 미들웨어
function verifyToken(req, res, next) { // 클라이언트에서 데이터를 보내면 JWT 검증을 통해 사용자 인증함.
  const token = req.headers.authorization?.split(" ")[1]; // 띄어쓰기 기준으로 띄우고 1번째 문자열을 가져옴.(즉 토큰 값.)
  if (!token) return res.status(401).json({ message: "토큰 없음" }); // 토큰이 없으면 인증되지 않은 요청 

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // JWT 서명을 사용해서 토큰이 위조되지 않았는지 검증.
    req.user = decoded; // jwt에 들어가있는 값을 req.user를 통해 저장
    next();
  } catch (err) {
    return res.status(403).json({ message: "토큰 유효하지 않음" });
  }
}

// 사용자 조회
app.get("/users", async (req, res) => {
  try {
    const result = await sql`SELECT * FROM users`;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 이메일 인증
app.post("/email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) return res.status(400).json({ message: "이메일을 다시 입력해주세요." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "올바른 이메일을 입력해주세요." });

    const code = Math.floor(100000 + Math.random() * 900000);
    codes[email] = { code, expiresAt: Date.now() + 5 * 60000 };

    await transporter.sendMail({
      from: `"이메일 인증" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "이메일 인증 코드",
      text: `인증코드는 [${code}] 입니다.`,
    });

    res.status(200).json({ message: "이메일 전송 성공", code });
  } catch (err) {
    res.status(500).json({ error: "이메일 전송 실패" });
  }
});

// 인증 코드 확인
app.post("/verify", (req, res) => {
  const { email, email_check } = req.body;
  const record = codes[email];
  if (record && record.code === Number(email_check) && Date.now() <= record.expiresAt) {
    return res.status(200).json({ message: "인증 성공" });
  }
  return res.status(400).json({ message: "인증 실패" });
});

// 회원가입
app.post("/users/register", async (req, res) => {
  try {
    const { id, password, name, gender, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [emailExists] = await sql`SELECT 1 FROM users WHERE email = ${email}`;
    if (emailExists) return res.status(409).json({ message: "이미 가입된 이메일 입니다." });

    const [idExists] = await sql`SELECT 1 FROM users WHERE id = ${id}`;
    if (idExists) return res.status(403).json({ message: "아이디가 중복 되었습니다." });

    const [user] = await sql`
      INSERT INTO users (id, password, name, gender, email)
      VALUES (${id}, ${hashedPassword}, ${name}, ${gender}, ${email})
      RETURNING *;
    `;

    if (!user.role) {
      const [updated] = await sql`
        UPDATE users SET role = 'user' WHERE id = ${user.id} RETURNING *;
      `;
      return res.status(201).json({ message: "회원가입 성공!", user: updated });
    }

    return res.status(201).json({ message: "회원가입 성공!", user });
  } catch (err) {
    return res.status(500).json({ error: "회원가입 실패!" });
  }
});

// 로그인: 학생
app.post("/users/login/student", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (!user || user.role !== "user") return res.status(403).json({ message: "학생 계정이 아닙니다." });
    if (!await bcrypt.compare(password, user.password)) return res.status(401).json({ message: "비밀번호가 틀렸습니다." });

    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
    return res.status(200).json({ message: "ok", token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (err) {
    res.status(500).json({ message: "로그인 오류", error: err.message });
  }
});

// 로그인: 교수
app.post("/users/login/professor", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (!user || user.role !== "admin") return res.status(403).json({ message: "관리자 계정이 아닙니다." });
    if (!await bcrypt.compare(password, user.password)) return res.status(401).json({ message: "비밀번호가 틀렸습니다." });

    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
    return res.status(200).json({ message: "ok", token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (err) {
    return res.status(500).json({ message: "서버 오류", error: err.message });
  }
});

// 공지사항 작성
app.post("/notices", verifyToken, async (req, res) => {
  try {
    const { Title, Content } = req.body;
    const author_id = req.user.id;

    const [notice] = await sql`
      INSERT INTO notices (title, content, author_id)
      VALUES (${Title}, ${Content}, ${author_id})
      RETURNING *; 
    `; // 구조 분해 할당으로 데이터베이스 반환 값이 객체로 저장 됨.

    return res.status(201).json({
      message: "데이터 삽입 성공!",
      notice_id: notice.id, // ✔ 프론트에서 notice_id 바로 사용 가능
      notice
    });
  } catch (err) {
    return res.status(500).json({ error: "서버 오류!", detail: err.message });
  }
});

// 파일 업로드
app.post("/notices/file", upload.single("file"), async (req, res) => {
  const File = req.file;
  const { notice_id } = req.body;

  if (!File) {
    return res.status(400).json({ message: "파일이 업로드 되지 않았습니다." });
  }

  if (!notice_id) {
    return res.status(400).json({ message: "공지사항 ID가 전달되지 않았습니다." });
  }

  try {
    const [uploadedFile] = await sql`
      INSERT INTO notices_files (notice_id, filename, file_path, file_type)
      VALUES (${notice_id}, ${File.filename}, ${File.path}, ${File.mimetype})
      RETURNING *;
    `;

    res.status(200).json({
      message: "파일 업로드 성공",
      file: uploadedFile
    });
  } catch (err) {
    console.error("파일 업로드 중 오류:", err);
    res.status(500).json({
      message: "서버 오류 발생",
      error: err.message
    });
  }
});
// 파일 목록만 따로 가져오기.
app.get("/notices/files/:noticeId", async (req, res) => {
  const noticeId = req.params.noticeId;

  try {
    const files = await sql`
      SELECT id, filename, file_path, file_type, created_at
      FROM notices_files
      WHERE notice_id = ${noticeId}
      ORDER BY created_at ASC
    `;

    res.status(200).json({ files }); // ← 키도 영어로 수정하는 게 좋아
  } catch (err) {
    console.error("파일 목록 조회 실패:", err); // ← 여기서도 catch 매개변수를 e → err로
    res.status(500).json({ message: "파일 조회 중 서버 오류" });
  }
});


app.get("/notices/list", async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.search || "";

  try {
    const result = await sql`
      SELECT 
        n.id,
        n.title,
        n.content,
        u.name AS author_name,
        n.created_at,
        n.views_count,
        f.filename
      FROM notices n
      JOIN users u ON n.author_id = u.id
      LEFT JOIN notices_files f ON n.id = f.notice_id
      WHERE n.title ILIKE ${'%' + search + '%'}
        OR u.name ILIKE ${'%' + search + '%'}
      ORDER BY n.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [{ count }] = await sql`
      SELECT COUNT(*)::int
      FROM notices n
      JOIN users u ON n.author_id = u.id
      WHERE n.title ILIKE ${'%' + search + '%'}
        OR u.name ILIKE ${'%' + search + '%'}
    `;

    return res.status(200).json({ notices: result, total: count });
  } catch (e) {
    console.error("공지사항 목록 가져오기 실패", e);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
});

app.get("/notices/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [notice] = await sql`
      SELECT 
        n.*, 
        u.name AS author_name,
        f.filename
      FROM notices n
      JOIN users u ON n.author_id = u.id
      LEFT JOIN notices_files f ON n.id = f.notice_id
      WHERE n.id = ${id};
    `;

    if (!notice) {
      return res.status(404).json({ message: "공지사항이 존재하지 않습니다." });
    }

    res.status(200).json(notice);
  } catch (err) {
    console.error("상세 공지사항 조회 실패:", err);
    res.status(500).json({ message: "서버 에러" });
  }
});

app.patch('/notices/:id/views', async (req, res) => {
  const { id } = req.params;

  try {
    await sql`
      UPDATE notices
      SET views_count = views_count+1
      WHERE id = ${id};
    `;
    res.status(200).json({ message: "조회수 증가 성공" });
  } catch (err) {
    console.error("조회수 증가 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

app.delete("/notices/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM notices WHERE id = ${id}`;
    res.status(200).json({ message: "삭제 성공" });
  } catch (err) {
    console.error("삭제 실패", err);
    res.status(500).json({ message: "서버 오류" });
  }
});
app.post("/board/write", verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const author_id = req.user.id; // JWT 토큰으로부터 유저 ID 추출.

    const [write] = await sql`
      INSERT INTO board (title, content,author_id)
      VALUES (${title}, ${content}, ${author_id})
      RETURNING *;
    `;

    return res.status(201).json({ message: "입력 성공", write });
  } catch (err) {
    console.error("DB 삽입 실패:", err);
    res.status(500).json({ message: "서버 오류", error: err.message });
  }
});
app.get("/board/list", async (req, res) => {
  try {
    const result = await sql`
      SELECT 
        b.id,
        b.title,
        b.content,
        b.created_at,
        b.views_count,
        u.id AS author_id,
        u.name AS author_name
      FROM board b
      JOIN users u ON b.author_id = u.id
      ORDER BY b.created_at DESC;
    `;

    res.status(200).json(result);
  } catch (err) {
    console.error("board 불러오기 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});
/*
      UPDATE notices
      SET views_count = views_count+1
      WHERE id = ${id};
*/
app.patch("/board/update/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await sql`
    UPDATE board
    SET views_count = views_count+1
    WHERE id = ${id}
    RETURNING *;
  `;

    if (result.length === 0) {
      return res.status(404).json({ message: "해당 게시글을 찾을 수 없습니다." });
    }
    res.status(200).json({ message: "조회수 증가 성공" });
  } catch (err) {
    console.error("업데이트 실패", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

app.get("/board/Nation", async (req, res) => {
  const page = Number(req.query.page) || 1;      // 현재 페이지
  const limit = Number(req.query.limit) || 10;   // 페이지당 항목 수
  const offset = (page - 1) * limit;
  const search = req.query.search || "";

  try {
    const result = await sql`
      SELECT 
        b.id,
        b.title,
        b.content,
        b.author_id,
        b.created_at,
        u.name AS author_name
      FROM board b
      JOIN users u ON b.author_id = u.id
      WHERE
        b.title ILIKE ${'%'+search+'%'}
        OR b.content ILIKE ${'%'+ search + '%'}
        OR u.name ILIKE ${'%'+search+'%'}
      ORDER BY b.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [{ count }] = await sql`
      SELECT COUNT(*)::int
      FROM board b
      JOIN users u ON b.author_id = u.id
      WHERE 
        b.title ILIKE ${'%'+search+'%'}
        OR b.content ILIKE ${'%'+search+'%'}
        OR u.name ILIKE ${'%'+search+'%'}
    `;

    return res.status(200).json({ boards: result, total: count });
  } catch (err) {
    console.error("공지사항 목록 가져오기 실패:", err);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
});
app.delete("/board/delete/:id",async (req,res)=>{
  const {id} = req.params;
  try{
    await sql `DELETE FROM board WHERE id = ${id}`;
    res.status(200).json({message: "데이터 삭제 성공."})
  } catch(err){
    console.error("삭제 실패",err);
    res.status(500).json({message: "서버 오류"});
  }
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`서버 실행 중: http://0.0.0.0:${PORT}`);
});
