
import './App.css';
import {Home} from './component/home';
import {UserInfo} from './component/usersInfo';
import {GroupDetail} from './component/groupDetail';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
export const contractAddress = "0x228ecf90bA6a4085593F174Ae19Aa2dfE93BE763";


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