import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./Main/Main";
import Login from "./Login/Login";
import Membership from "./Membership/Membership";

function App() {
  return (
    <Router>
      <Routes>
        {/* '/'로 접속해도 Main이 뜨게! */}
        <Route path="/" element={<Main />} />
        <Route path="/main" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/membership" element={<Membership />} />
        {/* 기타 라우트 */}
      </Routes>
    </Router>
  );
}

export default App;
