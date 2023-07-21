import { useEffect } from 'react';
import { useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import contract from '../contracts/contract.json'
import {contractAddress,groupManagerContractAddress} from '../App';
import groupManagerContractABI from '../contracts/groupManagerContractABI.json';
const abi = contract;
export function Home(){
    const navigate = useNavigate();
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

    const checkUserAccount = async()=>{
        try{
            const { ethereum } = window;

            if(ethereum){
                const provider = new ethers.BrowserProvider(ethereum);
                const signer = await provider.getSigner();
                if(currentAccount==null) return;
                const tradeContract = new ethers.Contract(contractAddress, abi, signer);
                
                console.log("Create account");
                let tradeTxn = await tradeContract.getUserInfo(currentAccount);
                if(tradeTxn!="" || tradeTxn!=null) setName(tradeTxn);
            }
            else{
                console.log("Ethereum object does not exist");
            }

        } 
        catch(err){
            console.log(err);
        }

    }

    const [currentAccount, setCurrentAccount] = useState(null);
    const [name, setName] = useState('');
    const [input, setInput] = useState('');
    const [params, setParams] = useState([]);
    const connectWalletHandler = async () => { 
        const { ethereum } = window;
        if(!ethereum){
            alert("Please install the Metamask Wallet!");
        }

        try{
            const accounts = await ethereum.request({method: 'eth_requestAccounts'});
            console.log("Account Found! Address is：", accounts[0]);
            if(currentAccount && currentAccount == accounts[0]) return;
            setCurrentAccount(accounts[0]);
        }
        catch(err){
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
    const init = async () => {
        function checkParam(list1,list2){
            if(list1.length!==list2.length) return false;
            for(let i=0;i<list1.length;i++){
                if(i=== 7 || i===8) continue;
                if(list1[i]!==list2[i]) {
                    //alert(i.toString() +" "+ list1[i]+" "+list2[i]);
                    return false;
                }
            }
            return true;
        }
        const { ethereum } = window;
        if(!ethereum){
          console.log("Please install the Metamask Wallet!");
          return;
        }
        console.log(1);
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
  
        // Initialize the GroupManager contract
        const groupManagerContract = new ethers.Contract(groupManagerContractAddress, groupManagerContractABI, signer);
        //setGroupManagerContract(groupManagerContract);
  
        groupManagerContract.on("db_createGroup", (...args) => {
        if(!checkParam(args,params)){
            //alert(args);
            setParams(args);
            console.log(args);
        }
          
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

    function createSection() {
        const handleInputChange = (event) => {
            setInput(event.target.value);
        };

        const navigateUser =() =>{
            navigate("/userInfo");
        }

        const handlePaymentChange = (event) => {  
            setPayAmount(event.target.value);
        };

        const reportHandler =async () => { 
        try{
            const { ethereum } = window;

            if(ethereum){
                const provider = new ethers.BrowserProvider(ethereum);
                const signer = await provider.getSigner();
                const tradeContract = new ethers.Contract(contractAddress, abi, signer);
                
                console.log("Create account");
                setName(input);
                
                let tradeTxn = await tradeContract.createAccount(currentAccount,input);
                
                console.log(tradeTxn);
            }
            else{
                console.log("Ethereum object does not exist");
            }

        } 
        catch(err){
            console.log(err);
        }
    }

    if(!name)
    return (
        <div>
            <input onChange={handleInputChange} />
            <button onClick={reportHandler} className='cta-button mint-nft-button'>
            Create Account
            </button>
        </div>
    );
    else 
    return(
        <div>
            <div>Welcome {name}</div>
            <input placeholder="Payment Amount" onChange={handlePaymentChange}/>
            <button onClick={paymentHandler} className='cta-button mint-nft-button'>
            Pay
            </button>
            <br></br>
            <br></br>
            <button onClick={navigateUser} className='cta-button mint-nft-button' style={{marginBottom: "10px"}}>
            User info
            </button>
        </div>
    );

    }

    useEffect(() => {
        checkWalletIsConnected();
        if(currentAccount){
            init();
            checkUserAccount();
        }
        
    }, [currentAccount])

    return (
    <div className='main-app'>
        <h1>6452 Assignment 2</h1>
        <div>
        {currentAccount ? createSection() : connectWalletButton()}
        </div>
    </div>
    )
}