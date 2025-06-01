import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState } from 'react';
import Main from "./Main/Main";
import Login from "./Login/Login";
import Membership from "./Membership/Membership";
import Boardwrite from "./Board/Boardwrite/Boardwrite"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Board from "./Board/Board";
const queryClient = new QueryClient();
function App() {
  const [isLoggedIn,setisLoggedIn] = useState(false);
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* '/'로 접속해도 Main이 뜨게! */}
          <Route path="/" element={<Main/>} />
          <Route path="/main" element={<Main isLoggedIn={isLoggedIn}/>} />
          <Route path="/login" element={<Login setisLoggedIn = {setisLoggedIn}/>} />
          <Route path="/membership" element={<Membership/>} />
          <Route path="/board" element = {<Board/>}></Route>
          <Route path="/board/write"element = {<Boardwrite/>}/>
          {/* 기타 라우트 */}
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
