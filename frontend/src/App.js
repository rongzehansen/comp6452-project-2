
import './App.css';
import {Home} from './component/home';
import {UserInfo} from './component/usersInfo';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
export const contractAddress = "0x2894aC41A3b23F20a85359508A8E4d3BC48bcf38";


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
        </Routes>
      </div>
    </Router>
      

    )    

}
  
  export default App;