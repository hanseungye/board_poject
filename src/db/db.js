require("dotenv").config();

const http = require("http");
const { neon } = require("@neondatabase/serverless");
console.log("DATABASE_URL:", process.env.DATABASE_URL);

// sql 함수로 쿼리 보내기
const sql = neon(process.env.DATABASE_URL);

const requestHandler = async (req, res) => {
  try {
    // 예시 쿼리: 데이터베이스 버전 정보
    const result = await sql`SELECT version()`;
    const { version } = result[0];
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(version);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("DB Error: " + err.message);
  }
};