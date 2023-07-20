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
      const { ethereum } = window;
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();

      // Initialize the GroupManager contract
      const groupManagerContract = new ethers.Contract(groupManagerContractAddress, groupManagerContractABI, signer);
      //setGroupManagerContract(groupManagerContract);

      groupManagerContract.on("db_createGroup", (...args) => {
        console.log(args);
      });
      groupManagerContract.on("db_updateStatus", (...args) => {
        console.log(args);
      });
      groupManagerContract.on("db_updateInterestRate", (...args) => {
        console.log(args);
      });
      groupManagerContract.on("db_updateMonthlyPayment", (...args) => {
        console.log(args);
      });
      groupManagerContract.on("db_updatePeriod", (...args) => {
        console.log(args);
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
  }, []);

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
