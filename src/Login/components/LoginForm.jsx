import styles from '../Login.module.css'

function LoginForm({ email, setEmail, password, setPassword, handleSubmit }) {
  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.email}>
        <label htmlFor="email">이메일</label>
        <input
          type="email"
          id="email"
          placeholder="example@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className={styles.login_button}>로그인</button>
      </div>
    </form>
  )
}
export default LoginForm;
