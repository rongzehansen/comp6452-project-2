import './App.css';
import React, { useEffect,useState } from 'react';
import { ethers } from 'ethers';
import { Navbar } from './component/navbar';
import { Home } from './component/home';
import { UserInfo } from './component/usersInfo';
import { GroupDetail } from './component/groupDetail';
import { GroupDetail_vote_offchain } from './component/groupDetail_vote_offchain';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';


export const contractAddress = "0x24522A1D5D945C29bB0ef3D1d12385AC231a3a59";
export const groupManagerContractAddress = "0xA90fF86e1181BF88036261132100c1a150E866a3";
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