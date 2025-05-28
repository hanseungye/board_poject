import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./Main/Main";
import Login from "./Login/Login";
import Membership from "./Membership/Membership";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;
