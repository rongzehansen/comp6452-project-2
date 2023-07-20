
import './App.css';
import {Home} from './component/home';
import {UserInfo} from './component/usersInfo';
import {GroupDetail} from './component/groupDetail';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
export const contractAddress = "0xe418482d0EBA585428b7b0a24E4B7c60162D1094";


function App() {
  
    return(
      <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
          </ul>
        </nav>
        <Routes>

          <Route path='/' element={<Home/>} />
          <Route path='/userInfo' element={<UserInfo/>} />
          <Route path='/groupDetail' element={<GroupDetail/>} />
        </Routes>
      </div>
    </Router>
      

    )    

}
  
  export default App;