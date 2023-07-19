import { useEffect } from 'react';
import { useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import contract from '../contracts/contract.json'
import {contractAddress} from '../App'
const abi = contract;

function DetailCard(props){
    //alert(props.group.identity);
    return (
        
        <div style={{height: "300px", width: "80%", background: "gray", color: "white", fontSize: "20px", padding: "10px"}} key={props.index}>
        <div>
            {`Members: `}
            <ul>
                <p> some map functions to list memebers</p>
            </ul>
        </div>

    </div>);

}

export function GroupDetail(){
    const navigate = useNavigate();

    const handleGoPrevious = () => {
        navigate('/userInfo'); 
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

    const [currentAccount, setCurrentAccount] = useState(null);
    const [name, setName] = useState('');
    const [input, setInput] = useState('');

    useEffect(() => {
        checkWalletIsConnected();
        if(currentAccount)
        checkUserAccount();
    }, [currentAccount,name])


    return (
        <div>
           <h1>Group Detail Page</h1>
          

           <div>
            <button onClick={handleGoPrevious} className='cta-button mint-nft-button'>Back to UserInfo</button>
            </div>

        </div>

        

    );


}    