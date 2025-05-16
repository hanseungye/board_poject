import { BrowserRouter,Routes,Route } from 'react-router-dom';
import Main from './Main/Main'; // 중괄호 없이 원하는 이름(Login)으로 불러옴
import Login from './Login/Login';
import Membership from './Membership/Membership';

function App() {

  const basename = process.env.NODE_ENV === "production" ? "/Main":"";
  return (
    <BrowserRouter basename={basename}>
      <Routes>
          <Route path="/" element ={<Main/>}/>
          <Route path ="/login" element = {<Login/>}/>
          <Route path='/membership' element = {<Membership/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
