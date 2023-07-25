import { useEffect } from 'react';
import { useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import contract from '../contracts/contract.json'
import { contractAddress, groupManagerContractAddress } from '../App';
import groupManagerContractABI from '../contracts/groupManagerContractABI.json';
const abi = contract;

export function Home() {
  const navigate = useNavigate();
  const checkWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Please install the Metamask Wallet!");
      return;
    }
    else {
      console.log("Wallet exists. Ready to go!");
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Authorized Account Found! Address is：", account);
      setCurrentAccount(account);
    }
    else {
      console.log("No Authorized Account Found.");
    }

  }

  const checkUserAccount = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        if (currentAccount == null) return;
        const tradeContract = new ethers.Contract(contractAddress, abi, signer);

        console.log("Create account");
        let tradeTxn = await tradeContract.getUserInfo(currentAccount);
        if (tradeTxn != "" || tradeTxn != null) setName(tradeTxn);
      }
      else {
        console.log("Ethereum object does not exist");
      }

    }
    catch (err) {
      console.log(err);
    }

  }

  const [currentAccount, setCurrentAccount] = useState(null);
  const [name, setName] = useState('');
  const [input, setInput] = useState('');
  const [params, setParams] = useState([]);
  const connectWalletHandler = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Please install the Metamask Wallet!");
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Account Found! Address is：", accounts[0]);
      if (currentAccount && currentAccount == accounts[0]) return;
      setCurrentAccount(accounts[0]);
    }
    catch (err) {
      console.log(err);
    }
  }

  const [payAmount, setPayAmount] = useState('');

  const paymentHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Ethereum object does not exist");
      return;
    }

    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const tradeContract = new ethers.Contract(contractAddress, abi, signer);

    //const amountToPay = ethers.parseEther(payAmount);

    try {
      let paymentTxn = await tradeContract.deposit({
        value: payAmount
      });
      console.log("Payment transaction:", paymentTxn);
    } catch (err) {
      console.log(err);
    }
  };

  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
        Connect Wallet
      </button>
    )
  }
  const handleCreateGroup = async (payload, args) => {
    try {
      const response = await fetch('http://localhost:5000/api/group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log(data);
      setParams(args);
    } catch (error) {
      console.error('Error in creating group:', error);
    }
  };
  
  const handleUpdateGroup = async (id, payload, args) => {
    try {
      const response = await fetch(`http://localhost:5000/api/group/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log(data);
      setParams(args);
    } catch (error) {
      console.error(`Error in updating group ${id}:`, error);
    }
  };
  
  const init = async () => {
    function checkParam(list1, list2) {
      if (list1.length !== list2.length) return false;
      for (let i = 0; i < list1.length; i++) {
        if (i === 7 || i === 8) continue;
        if (list1[i] !== list2[i]) {
          alert(i.toString() + " " + list1[i] + " " + list2[i]);
          return false;
        }
      }
      return true;
    }
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Please install the Metamask Wallet!");
      return;
    }
    console.log(1);
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();

    // Initialize the GroupManager contract
    const groupManagerContract = new ethers.Contract(groupManagerContractAddress, groupManagerContractABI, signer);
    //setGroupManagerContract(groupManagerContract);

  //   groupManagerContract.on("db_createGroup", (...args) => {
  //     if (!checkParam(args, params)) {
  //       alert(args);
  //       setParams(args);
  //       console.log(args);
  //     }

  //   });
  //   groupManagerContract.on("db_updateStatus", (...args) => {
  //     if (!checkParam(args, params)) {
  //       alert(args);
  //       setParams(args);
  //       console.log(args);
  //     }
  //   });
  //   groupManagerContract.on("db_updateInterestRate", (...args) => {
  //     if (!checkParam(args, params)) {
  //       alert(args);
  //       setParams(args);
  //       console.log(args);
  //     }
  //   });
  //   groupManagerContract.on("db_updateMonthlyPayment", (...args) => {
  //     if (!checkParam(args, params)) {
  //       alert(args);
  //       setParams(args);
  //       console.log(args);
  //     }
  //   });
  //   groupManagerContract.on("db_updatePeriod", (...args) => {
  //     if (!checkParam(args, params)) {
  //       alert(args);
  //       setParams(args);
  //       console.log(args);
  //     }
  //   });
  // groupManagerContract.on("db_createGroup", (...args) => {
  //   if (!checkParam(args, params)) {
  //     alert(args);
  //     console.log(args);
  //     const payload = {
  //         index: args.index,
  //         name: args.name,
  //         owner: args.owner,
  //         voteOpen: args.status.voteOpen,
  //         depositOpen: args.status.depositOpen,
  //         applicationOpen: args.status.applicationOpen,
  //         interestRate: args.interestRate,
  //         monthlyPayment: args.monthlyPayment,
  //         period: args.period,
  //         timeCreated: args.timeCreated,
  //         timeUpdated: args.timeUpdated,
  //     }
  //     handleCreateGroup(payload, args);
  //   }

  // });

let lastCallTime = 0;
groupManagerContract.on("db_createGroup", (...args) => {
  const now = Date.now();
  if (now - lastCallTime < 10) {
    // Ignore call if it's within 10ms of the last call
    return;
  }
  lastCallTime = now;

  if (!checkParam(args, params)) {
    alert(args);
    console.log(args);
    const payload = {
        index: args.index,
        name: args.name,
        owner: args.owner,
        voteOpen: args.status.voteOpen,
        depositOpen: args.status.depositOpen,
        applicationOpen: args.status.applicationOpen,
        interestRate: args.interestRate,
        monthlyPayment: args.monthlyPayment,
        period: args.period,
        timeCreated: args.timeCreated,
        timeUpdated: args.timeUpdated,
    }
    handleCreateGroup(payload, args);
  }
});

  groupManagerContract.on("db_updateStatus", (...args) => {
    if (!checkParam(args, params)) {
      alert(args);
      console.log(args);
      const payload = {
          // id: args.index,
          // index: args.index,
          voteOpen: args.status.voteOpen,
          depositOpen: args.status.depositOpen,
          applicationOpen: args.status.applicationOpen,
      }        
      handleUpdateGroup(args.index, payload, args);
    }
  });
  groupManagerContract.on("db_updateInterestRate", (...args) => {
    if (!checkParam(args, params)) {
      alert(args);
      console.log(args);
      const payload = {
          // id: args.index,
          // index: args.index,
          interestRate: args.interestRate,
      }        
      handleUpdateGroup(args.index, payload, args);
    }
  });
  groupManagerContract.on("db_updateMonthlyPayment", (...args) => {
    if (!checkParam(args, params)) {
      alert(args);
      console.log(args);
      const payload = {
          // id: args.index,
          // index: args.index,
          name: args.name,
          monthlyPayment: args.monthlyPayment,
      }        
      handleUpdateGroup(args.index, payload, args);
    }
  });
  groupManagerContract.on("db_updatePeriod", (...args) => {
    if (!checkParam(args, params)) {
      alert(args);
      console.log(args);
      const payload = {
          // id: args.index,
          // index: args.index,
          period: args.period,
      }        
      handleUpdateGroup(args.index, payload, args);
    }
  });
    return () => {
      groupManagerContract.removeAllListeners("db_createGroup");
      groupManagerContract.removeAllListeners("db_updateStatus");
      groupManagerContract.removeAllListeners("db_updateInterestRate");
      groupManagerContract.removeAllListeners("db_updateMonthlyPayment");
      groupManagerContract.removeAllListeners("db_updatePeriod");
    };

  }

  //withdraw, get wei back to metamask
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  function createSection() {
    const handleInputChange = (event) => {
      setInput(event.target.value);
    };

    const navigateUser = () => {
      navigate("/userInfo");
    }

    const handlePaymentChange = (event) => {
      setPayAmount(event.target.value);
    };

    const reportHandler = async () => {
      try {
        const { ethereum } = window;

        if (ethereum) {
          const provider = new ethers.BrowserProvider(ethereum);
          const signer = await provider.getSigner();
          const tradeContract = new ethers.Contract(contractAddress, abi, signer);

          console.log("Create account");
          setName(input);

          let tradeTxn = await tradeContract.createAccount(currentAccount, input);

          console.log(tradeTxn);
        }
        else {
          console.log("Ethereum object does not exist");
        }

      }
      catch (err) {
        console.log(err);
      }
    }

    const withdraw = async () => {
      const { ethereum } = window;
      if(ethereum) {
          const provider = new ethers.BrowserProvider(ethereum);
          const signer = await provider.getSigner();
          if(currentAccount == null) return;
          const tradeContract = new ethers.Contract(contractAddress, abi, signer);
          await tradeContract.withdraw(withdrawAmount);
      } else {
          console.log("Ethereum object does not exist");
      }
    };
    

    if (!name)
      return (
        
          <div  className="input-group mb-3" >
            
            <input  onChange={handleInputChange} type="text" className="form-control" placeholder="Create Account" aria-label="Recipient's username" aria-describedby="button-addon2"/>
            <button onClick={reportHandler} className="btn btn-outline-secondary" type="button" id="button-addon2">
              Create Account
            </button>
          </div>
        
      );
    else
      return (
        <div>
          <div>Welcome {name}</div>
          
          <div className="input-group mb-3" style={{width:"500px",margin:"auto"}}>
          <input onChange={handlePaymentChange} type="text" className="form-control" placeholder="Payment amount" aria-label="Recipient's username" aria-describedby="button-addon2"/>
          <button onClick={paymentHandler} className="btn btn-outline-secondary" type="button" id="button-addon2">Pay</button>
          
          </div>
          <br></br> 
          <br></br>     
          <div className="input-group mb-3" style={{width:"500px",margin:"auto"}}>         
          <input placeholder="Withdraw Amount" onChange={e => setWithdrawAmount(e.target.value)} className="form-control"/>
          <button onClick={withdraw} className="btn btn-outline-secondary">Withdraw</button>
          </div>      
          <br></br> 
          <br></br> 
          <button onClick={navigateUser} className="btn btn-success" style={{ marginBottom: "10px" }}>
            User info
          </button>
        </div>
      );

  }

  useEffect(() => {
    checkWalletIsConnected();
    if (currentAccount) {
      init();
      checkUserAccount();
    }

  }, [currentAccount])

  return (
    <div className='main-app'>
      <h1 className="text-primary">6452 Assignment 2</h1>
      <div>
        {currentAccount ? createSection() : connectWalletButton()}
      </div>
    </div>
  )
}