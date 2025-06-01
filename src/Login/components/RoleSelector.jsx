import styles from '../Login.module.css'

function RoleSelector ({role,setRole}){
  return (
    <div className={styles.student}>
      <button
        className={`${styles.role_button} ${role === '교수' ? styles.active : ''}`}
        onClick={() => setRole('교수')}
      >
        교수
      </button>
      <button
        className={`${styles.role_button} ${role === '학생' ? styles.active : ''}`}
        onClick={() => setRole('학생')}
      >
        학생
      </button>
    </div>
  );
}

export default RoleSelector;
