import { useEffect } from 'react';
import { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import contract from './contracts/contract.json'

const contractAddress = "0xA2488deA449955e35789eC6C13e3cd19f7a0A98c";
const abi = contract;


function App() {
    const checkWalletIsConnected = async () => {     
        const { ethereum } = window;
        if(!ethereum){
            console.log("Please install the Metamask Wallet!");
            return;
        }
        else{
            console.log("Wallet exists. Ready to go!");
        }

        const accounts  = await ethereum.request({ method: 'eth_accounts' });

        if(accounts.length !== 0){
            const account = accounts[0];
            console.log("Authorized Account Found! Address is：", account);
            setCurrentAccount(account);
        }
        else{
            console.log("No Authorized Account Found.");
        }
        
    }

    const [currentAccount, setCurrentAccount] = useState(null);

    const connectWalletHandler = async () => { 
        const { ethereum } = window;
        if(!ethereum){
            alert("Please install the Metamask Wallet!");
        }

        try{
            const accounts = await ethereum.request({method: 'eth_requestAccounts'});
            console.log("Account Found! Address is：", accounts[0]);
            setCurrentAccount(accounts[0]);
        }
        catch(err){
            console.log(err);
        }
    }
  
    const reportHandler = async () => { 
        try{
            const { ethereum } = window;

            if(ethereum){
                const provider = new ethers.BrowserProvider(ethereum);
                const signer = await provider.getSigner();
                const tradeContract = new ethers.Contract(contractAddress, abi, signer);
                
                console.log("Create account");
                let tradeTxn = await tradeContract.createAccount("0xC0436A7e7Eba86F044a0257ac5AE3a4c102Ca591","ABC");
                console.log(tradeTxn);

                console.log("Mining, plz wait");
                //await tradeTxn.wait();

                console.log('Mined, see transaction: https://sepolia.etherscan.io/tx/${tradeTxn.hash}');
            }
            else{
                console.log("Ethereum object does not exist");
            }

        } 
        catch(err){
            console.log(err);
        }
    }
  
    const connectWalletButton = () => {
      return (
        <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
          Connect Wallet
        </button>
      )
    }
  
    const reportButton = () => {
      return (
        <button onClick={reportHandler} className='cta-button mint-nft-button'>
          Generate Report
        </button>
      )
    }
  
    useEffect(() => {
      checkWalletIsConnected();
    }, [])
  
    return (
      <div className='main-app'>
        <h1>6452 Assignment 2</h1>
        <div>
          {currentAccount ? reportButton() : connectWalletButton()}
        </div>
      </div>
    )
  }
  
  export default App;