import { useEffect } from 'react';
import { useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import contract from '../contracts/contract.json'
import {contractAddress} from '../App'
const abi = contract;


export function GroupDetail(){

    //get props from previous page
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const [groupId, setGroupId] = useState(searchParams.get('id'));
    const [identity, setIdentity] = useState(searchParams.get('identity'));

    const navigate = useNavigate();

    const handleGoPrevious = () => {
        navigate('/userInfo'); 
    };

    const [currentAccount, setCurrentAccount] = useState(null);
    const [name, setName] = useState('');
    const [balance, setBalance] = useState(0);

    //interest part
    const [isSettingInterest, setIsSettingInterest] = useState(false);
    const [interestRate, setInterestRate] = useState(5);
    const [inputRate, setInputRate] = useState(5);    
    const [inputGroupId, setInputGroupId] = useState('');

    const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
            setCurrentAccount(accounts[0]);
            // You can also call here other actions, like refreshing user data etc.
        } else {
            // Handle a situation where user disconnects their wallet
            setCurrentAccount(null);
        }
    };

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

    const getBalance = async() => {
        const { ethereum } = window;
        if(ethereum) {
            const provider = new ethers.BrowserProvider(ethereum);
            const signer = await provider.getSigner();
            if(currentAccount==null) return;
            const tradeContract = new ethers.Contract(contractAddress, abi, signer);
            let cur_balance = await tradeContract["getBalance(address)"](currentAccount);;
            setBalance(cur_balance);
        } else {
          console.log("Ethereum object does not exist");
        }

      }

      const decideInterestRate = async () => {
        const { ethereum } = window;
        if(ethereum) {
            const provider = new ethers.BrowserProvider(ethereum);
            const signer = await provider.getSigner();
            if(currentAccount == null) return;
            const tradeContract = new ethers.Contract(contractAddress, abi, signer);
            await tradeContract.setInterestRate(inputRate, inputGroupId);
            //let cur_rate = await tradeContract.getInterestRate(inputGroupId);
            setInterestRate(inputRate);//set(cur)
            setIsSettingInterest(false);
        } else {
            console.log("Ethereum object does not exist");
        }
    };

    useEffect(() => {
        const { ethereum } = window;
        checkWalletIsConnected();
        if(currentAccount)
        checkUserAccount();
        getBalance();
        console.log(balance);
        //alert(balance);
        if (ethereum) {
            // Subscribe to accounts change
            ethereum.on('accountsChanged', handleAccountsChanged);
    
            // It's important to properly clean up to avoid memory leaks
            return () => {
                ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
        setGroupId(searchParams.get('id'));
        setIdentity(searchParams.get('identity'));
    }, [currentAccount,name,balance,location.search])

    return (
        <div>
           <h1>Group Detail Page</h1>
           
            <div style={{height: "300px", width: "80%", background: "gray", color: "white", fontSize: "20px", padding: "10px"}}>
            <div>
                <div>Group ID: {groupId}</div>
                <div>Identity: {identity ==0 ? "Member" : "Owner"}</div>
            </div>
            <div>Your current balance is : {balance.toString()}</div>
                <div>
                    {`Members: `}
                    <ul>
                        <p> some functions to list memebers details</p>
                    </ul>
                </div>
                <div> Current Interest Rate is: {interestRate}%</div>
            </div>
            
            {identity === "1" && (
                <div>
                    <button className='cta-button mint-nft-button' onClick={() => setIsSettingInterest(true) }>Set Interest Rate</button>
                    {isSettingInterest && (
                    <div>
                        <input type="number" placeholder="Interest Rate" value={inputRate} onChange={e => setInputRate(e.target.value)}/>
                        <input type="number" placeholder="Group ID" value={inputGroupId} onChange={e => setInputGroupId(e.target.value)} />
                        <button onClick={decideInterestRate}>Confirm</button>
                    </div>
                    )}
                </div>
            )}
            <br></br>
            <br></br>
            <div>
            <button onClick={handleGoPrevious} className='cta-button mint-nft-button'>Back to UserInfo</button>
            </div>

        </div>

        

    );


}    