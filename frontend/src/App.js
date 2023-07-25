import './App.css';
import React, { useEffect,useState } from 'react';
import { ethers } from 'ethers';
import { Navbar } from './component/navbar';
import { Home } from './component/home';
import { UserInfo } from './component/usersInfo';
import { GroupDetail } from './component/groupDetail';
import { GroupDetail_vote_offchain } from './component/groupDetail_vote_offchain';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';


export const contractAddress = "0xa8aed318E7b5750D0d4205A0b677e7f8623101b2";
export const groupManagerContractAddress = "0x24089A257528254AA4b33B198383b63c6d65A300";
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
          <Route path='/groupDetail_vote_offchain' element={<GroupDetail_vote_offchain />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;