import './App.css';
import React, { useEffect } from 'react';
import { ethers } from 'ethers';
import { Home } from './component/home';
import { UserInfo } from './component/usersInfo';
import { GroupDetail } from './component/groupDetail';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import groupManagerContractABI from './contracts/groupManagerContractABI.json'

export const contractAddress = "0x228ecf90bA6a4085593F174Ae19Aa2dfE93BE763";

function App() {

  const groupManagerContractAddress = "0xbE70957C20914625a60040b7075C900C6756939f";

  useEffect(() => {
    const init = async () => {
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();

      // Initialize the GroupManager contract
      const groupManagerContract = new ethers.Contract(groupManagerContractAddress, groupManagerContractABI, signer);
      //setGroupManagerContract(groupManagerContract);
      
      groupManagerContract.on("db_createGroup", (from, value, event) => {
        console.log(from, value);
        console.log(event.blockNumber);
      });
      groupManagerContract.on("db_updateStatus", (from, value, event) => {
        console.log(from, value);
        console.log(event.blockNumber);
      });
      groupManagerContract.on("db_updateInterestRate", (from, value, event) => {
        console.log(from, value);
        console.log(event.blockNumber);
      });
      groupManagerContract.on("db_updateMonthlyPayment", (from, value, event) => {
        console.log(from, value);
        console.log(event.blockNumber);
      });
      groupManagerContract.on("db_updatePeriod", (from, value, event) => {
        console.log(from, value);
        console.log(event.blockNumber);
      });
      return () => {
        groupManagerContract.removeAllListeners("db_createGroup");
        groupManagerContract.removeAllListeners("db_updateStatus");
        groupManagerContract.removeAllListeners("db_updateInterestRate");
        groupManagerContract.removeAllListeners("db_updateMonthlyPayment");
        groupManagerContract.removeAllListeners("db_updatePeriod");
      };
      
    }
    init();
  }, [groupManagerContractAddress]);

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
