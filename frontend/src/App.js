import './App.css';
import React, { useEffect,useState } from 'react';
import { ethers } from 'ethers';
import { Home } from './component/home';
import { UserInfo } from './component/usersInfo';
import { GroupDetail } from './component/groupDetail';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';


export const contractAddress = "0xAfDb36Ae0723B5C943af6011EcaF004774EE1786";
export const groupManagerContractAddress = "0x528E120c353f5Ee670b8D32b5E043EFb6b2a63fd";
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