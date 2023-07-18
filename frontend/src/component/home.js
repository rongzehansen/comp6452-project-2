import { useEffect } from 'react';
import { useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import contract from '../contracts/contract.json'
import {contractAddress} from '../App'
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

    

    const connectWalletButton = () => {
    return (
        <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
        Connect Wallet
        </button>
    )
    }

    function createSection() {
        const handleInputChange = (event) => {
            setInput(event.target.value);
        };
        const navigateUser =() =>{
            navigate("/userInfo");
        }
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
            <button onClick={navigateUser} className='cta-button mint-nft-button'>
            User info
            </button>
        </div>
    );

    }

    useEffect(() => {
        checkWalletIsConnected();
        if(currentAccount)
        checkUserAccount();
    }, [currentAccount,name])

    return (
    <div className='main-app'>
        <h1>6452 Assignment 2</h1>
        <div>
        {currentAccount ? createSection() : connectWalletButton()}
        </div>
    </div>
    )
}