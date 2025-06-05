import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState } from 'react';
import Main from "./Main/Main";
import Login from "./Login/Login";
import Membership from "./Membership/Membership";
import Boardwrite from "./Board/Boardwrite/Boardwrite"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Board from "./Board/Board";
import NoticeDetail from "./NoticeDetail/NoticeDetail";
import Report from "./Report/Report";
import ReportWrite from "./Report/ReportWrite";
import Reportboard from "./Reportboard/Reportboard";
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
          <Route path = "/notices/:id" element = {<NoticeDetail/>}/>
          <Route path ="/report" element = {<Report/>}/>
          <Route path = "/report/write" element = {<ReportWrite/>}/>
          <Route path = "/report/:id" element = {<Reportboard/>}/>
          {/* 기타 라우트 */}
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
