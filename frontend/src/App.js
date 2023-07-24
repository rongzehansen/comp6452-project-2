import './App.css';
import React, { useEffect,useState } from 'react';
import { ethers } from 'ethers';
import { Navbar } from './component/navbar';
import { Home } from './component/home';
import { UserInfo } from './component/usersInfo';
import { GroupDetail } from './component/groupDetail';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';


export const contractAddress = "0xf30fa15fB2e1E51ed1de5ec8A6f867dA5e673f42";
export const groupManagerContractAddress = "0x99746867044a055525D7EB8DA37AC93Dfa4491b9";
function App() {

  
  

  return (
    <Router>
      <div>
        {/* <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
          </ul>
        </nav> */}
        <Navbar/>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/userInfo' element={<UserInfo />} />
          <Route path='/groupDetail' element={<GroupDetail />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;