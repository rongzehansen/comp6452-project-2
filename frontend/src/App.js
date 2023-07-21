import './App.css';
import React, { useEffect,useState } from 'react';
import { ethers } from 'ethers';
import { Home } from './component/home';
import { UserInfo } from './component/usersInfo';
import { GroupDetail } from './component/groupDetail';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';


export const contractAddress = "0x2a6b403e6BC43247397336930F6D6CBe82451805";
export const groupManagerContractAddress = "0x99746867044a055525D7EB8DA37AC93Dfa4491b9";
function App() {

  
  

  return (
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
          <Route path='/' element={<Home />} />
          <Route path='/userInfo' element={<UserInfo />} />
          <Route path='/groupDetail' element={<GroupDetail />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;