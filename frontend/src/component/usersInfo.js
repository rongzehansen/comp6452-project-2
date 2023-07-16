import { useEffect } from 'react';
import { useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import contract from '../contracts/contract.json'
import {contractAddress} from '../App'
const abi = contract;


function GroupCard(props){
    //alert(props.group.identity);
    return (
        <div style={{height: "200px", width: "80%", background: "gray", color: "white", fontSize: "20px", padding: "10px"}} key={props.index}>
        <div style={{marginBottom: "10px"}}>
            {`Group ID: ${props.group.id}`}
        </div>
        <div>
            {`Identity: ${props.group.identity ==0 ? "Member" : "Owner"}`}
        </div>
    </div>);

}

export function UserInfo(){
    const [currentAccount, setCurrentAccount] = useState(null);
    const [groupInfo, setGroupInfo] = useState([]);
    const [name, setName] = useState('');
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
                let tradeTxn = await tradeContract.createGroup();
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

    useEffect(() => {
        checkWalletIsConnected();
        if(currentAccount)
        checkUserAccount();
        getGroupInfo();
    }, [currentAccount,name])

    return (
        <div>
            User info page
            {groupInfo.map((group, index) => (<GroupCard group={group} key={index} index={index}></GroupCard>))}
            <div>
                <div>Welcome {name}</div>
                <button onClick={createGroup} className='cta-button mint-nft-button'>
                Create group
                </button>
            </div>
        </div>

    );


}