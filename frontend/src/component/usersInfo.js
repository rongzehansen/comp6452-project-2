import { useEffect } from 'react';
import { useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import contract from '../contracts/contract.json'
import {contractAddress} from '../App'
import './userInfo.css'

const abi = contract;

function GroupCard(props){
    
    //alert(props.group.identity);
    const navigate = useNavigate();

    const handleGroupDetailClick = () => {
        navigate(`/groupDetail?id=${props.group.id}&identity=${props.group.identity}`);
        
    };
    
    return (
        
        <div style={{height: "300px", width: "80%", background: "gray", color: "white", fontSize: "20px", padding: "10px",cursor: "pointer"}} key={props.index} onClick={handleGroupDetailClick}>
        <div style={{marginBottom: "10px"}}>
            {`Group Name: ${props.groupInput}`}
        </div>
        <div style={{marginBottom: "10px"}}>
            {`Group ID: ${props.group.id}`}
        </div>
        <div style={{marginBottom: "10px"}}>
            {`Identity: ${props.group.identity ==0 ? "Member" : "Owner"}`}
        </div>

    </div>);

}

export function UserInfo(){
    const [currentAccount, setCurrentAccount] = useState(null);
    const [groupInfo, setGroupInfo] = useState([]);
    const [name, setName] = useState('');
    const [groupInput, setGroupInput] = useState('');
    const [groupID, setgroupID] = useState('');
    const [memberAddress, setMemberAddress] = useState('');
    const [memberInfo, setMemberInfo] = useState([]);
    const [balance, setBalance] = useState(0);

    const navigate = useNavigate();

    const handleGroupInputChange = (event) => {
        setGroupInput(event.target.value);
    };

    const allocateGroupID = (event) => {
        setgroupID(event.target.value);
    };

    const handleMemberAddress = (event) => {
        setMemberAddress(event.target.value);
    };

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
            navigate('/');
           
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
                else navigate('/');
            }
            else{
                console.log("Ethereum object does not exist");
            }

        } 
        catch(err){
            console.log(err);
        }

    }

    const getGroupInfo = async()=>{
        try{
            const { ethereum } = window;

            if(ethereum){
                const provider = new ethers.BrowserProvider(ethereum);
                const signer = await provider.getSigner();
                if(currentAccount==null) return;
                const tradeContract = new ethers.Contract(contractAddress, abi, signer);
                
                console.log("Create account");
                let tradeTxn = await tradeContract.getGroupsInfo();
                setGroupInfo(tradeTxn);
                localStorage.setItem('groupId', String(tradeTxn[0].id))
                localStorage.setItem('identity', String(tradeTxn[0].identity))
            }
            else{
                console.log("Ethereum object does not exist");
            }
        } 
        catch(err){
            console.log(err);
        }
    }
    const createGroup = async()=>{
        try{
            const { ethereum } = window;

            if(ethereum){
                const provider = new ethers.BrowserProvider(ethereum);
                const signer = await provider.getSigner();
                if(currentAccount==null) return;
                const tradeContract = new ethers.Contract(contractAddress, abi, signer);
                
                console.log("Create account");
                let tradeTxn = await tradeContract.createGroup(groupInput);
                getGroupInfo();
            }
            else{
                console.log("Ethereum object does not exist");
            }

        } 
        catch(err){
            console.log(err);
        }
    }

    const getUserInfo = async()=>{
        try{
            const { ethereum } = window;
            if(ethereum){
                const provider = new ethers.BrowserProvider(ethereum);
                const signer = await provider.getSigner();
                if(currentAccount==null) return;
                const tradeContract = new ethers.Contract(contractAddress, abi, signer);
                
                console.log("try to get user info");
                let tradeTxn = await tradeContract.getUserInfo(memberAddress);
                setMemberInfo(tradeTxn);
            }
            else{
                console.log("Ethereum object does not exist");
            }

        } 
        catch(err){
            console.log(err);
        }
    }

    const addMember = async() =>{
        console.log("Adding member");
        try{
            const { ethereum } = window;
            if(ethereum){
                const provider = new ethers.BrowserProvider(ethereum);
                const signer = await provider.getSigner();
                if(currentAccount==null) return;
                const tradeContract = new ethers.Contract(contractAddress, abi, signer);
                
                console.log("Adding member");
                const groupIdNum = parseInt(groupID);
                let tradeTxn = await tradeContract.addToGroup(groupIdNum, memberAddress);
                console.log("Member added", tradeTxn);
                getUserInfo();
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

    useEffect(() => {
        const { ethereum } = window;
        checkWalletIsConnected();
        if(currentAccount)
        checkUserAccount();
        getGroupInfo();
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
    }, [currentAccount,name,balance])

    return (
        <div className="outerDiv">
            <h2>User info page</h2>
            {groupInfo.map((group, index) => (<GroupCard className="GroupCard" group={group} groupInput={groupInput} key={index} index={index}></GroupCard>))}
            <div>
                <div className="welcomeMessage">Welcome {name}</div>
                <div><h5>Your current balance is : {balance.toString()}</h5></div>
                <div className="inputButtonGroup">
                    <input onChange={handleGroupInputChange} placeholder="Enter group name"/>
                    <button onClick={createGroup} className='cta-button mint-nft-button'>
                    Create group
                    </button>
                </div>
                <br></br>
                <br></br>
                <div className="inputButtonGroup">
                    <input onChange={allocateGroupID} placeholder="Allocate member to Group"/>
                    <input onChange={handleMemberAddress} placeholder="Enter member address"/>
                    <button onClick={addMember} className='cta-button mint-nft-button'>
                        Add member
                    </button>
                </div>
            </div>
        </div>

    );


}