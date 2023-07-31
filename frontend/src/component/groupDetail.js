import { useEffect,useRef  } from 'react';
import { useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import contract from '../contracts/contract.json'
import {contractAddress} from '../App'
import logo from '../static/arrow-back-3783.png';
import './groupDetail.css';
import { Link } from 'react-router-dom';

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

    //get balance num
    const [balance, setBalance] = useState(0);

    //setinterest part, only owner can do it 
    const [isSettingInterest, setIsSettingInterest] = useState(false);
    const [interestRate, setInterestRate] = useState(0);
    const [inputRate, setInputRate] = useState(0);    

    //setmonthlypayment part, only owner can do it
    const [isSettingPayment, setIsSettingPayment] = useState(false);
    const [monthlyMoney, setMonthlyMoney] = useState(0);
    const [inputMoney, setInputMoney] = useState(0);    

    //group member pay the monthly money, done
    //group member start a kick vote and they will vote yes or no
    const [isStartingExpel, setIsStartingExpel] = useState(false);
    const [isVotingExpel, setIsVotingExpel] = useState(false);
    const [userAddress, setUserAddress] = useState('');
    const [voteResult, setVoteResult] = useState(null);

    //return the money to group account
    const [repayAmount, setRepayAmount] = useState(0); 
    const [isRepaying, setIsRepaying] = useState(false);

    // display who is the borrower
    const [borrower, setBorrower] = useState('');


    const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
            setCurrentAccount(accounts[0]);
            // You can also call here other actions, like refreshing user data etc.
        } else {
            // Handle a situation where user disconnects their wallet
            setCurrentAccount(null);
        }
    };

    //Checking if Metamask Wallet Exists
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

    //Check wether UserAccount has been created
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
                if(tradeTxn!=="" || tradeTxn!=null) setName(tradeTxn);
            }
            else{
                console.log("Ethereum object does not exist");
            }

        } 
        catch(err){
            console.log(err);
        }

    }

     //function to show current user balance
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
      
      //funtion to get interest rate from the smart contract
      const getInterest = async () => {
        const { ethereum } = window;
        if(ethereum) {
            const provider = new ethers.BrowserProvider(ethereum);
            const signer = await provider.getSigner();
            if(currentAccount == null) return;
            const tradeContract = new ethers.Contract(contractAddress, abi, signer);
            //alert(groupId);
            let cur_rate = await tradeContract.getInterestRate(groupId);
            setInterestRate(cur_rate);
            //setIsSettingInterest(false);
        } else {
            console.log("Ethereum object does not exist");
        }
    };

    // set the current group's interest rate, might not be used due to better version impleted, only group manager can do
    const setInterest = async () => {
        const { ethereum } = window;
        if(ethereum) {
            const provider = new ethers.BrowserProvider(ethereum);
            const signer = await provider.getSigner();
            if(currentAccount == null) return;
            const tradeContract = new ethers.Contract(contractAddress, abi, signer);
            await tradeContract.setInterestRate(inputRate, groupId);
            let cur_rate = await tradeContract.getInterestRate(groupId);
            setInterestRate(cur_rate);
            setIsSettingInterest(false);
        } else {
            console.log("Ethereum object does not exist");
        }
    };

    //get the money every memeber need to pay from the smart contract
    const getMonthlyPayment = async () => {
        const { ethereum } = window;
        if(ethereum) {
            const provider = new ethers.BrowserProvider(ethereum);
            const signer = await provider.getSigner();
            if(currentAccount == null) return;
            const tradeContract = new ethers.Contract(contractAddress, abi, signer);
            //alert(groupId);
            let cur_money = await tradeContract.getMonthlyPayment(groupId);
            setMonthlyMoney(cur_money);
            //setIsSettingInterest(false);
        } else {
            console.log("Ethereum object does not exist");
        }
    };

    //set the amount of money that every member need to pay each month, only group manager can do
    const setMonthlyPayment = async () => {
        const { ethereum } = window;
        if(ethereum) {
            const provider = new ethers.BrowserProvider(ethereum);
            const signer = await provider.getSigner();
            if(currentAccount == null) return;
            const tradeContract = new ethers.Contract(contractAddress, abi, signer);
            await tradeContract.setMonthlyPaymentAmount(inputMoney, groupId);
            let cur_money = await tradeContract.getMonthlyPayment(groupId);
            setMonthlyMoney(cur_money);
            setIsSettingPayment(false);
        } else {
            console.log("Ethereum object does not exist");
        }
    }

    //by click the button, it will excute the function and charge the money into group account
    const makePayment = async () => {
        const { ethereum } = window;
        if(ethereum) {
            const provider = new ethers.BrowserProvider(ethereum);
            const signer = await provider.getSigner();
            if(currentAccount == null) return;
            const tradeContract = new ethers.Contract(contractAddress, abi, signer);
            
            await tradeContract.monthlyPayment(groupId);
        } else {
            console.log("Ethereum object does not exist");
        }
    };

    //better set current interest function, only group manager can do
    const InputComponent=()=>{
        const handleBlur = () => {
            // Wait for 200ms before handling the blur event
            setTimeout(() => {
                setIsSettingInterest(false);
            }, 200);
        }
        const changeStatus=async ()=>{
            const { ethereum } = window;
            if(ethereum) {
                const provider = new ethers.BrowserProvider(ethereum);
                const signer = await provider.getSigner();
                if(currentAccount == null) return;
                const tradeContract = new ethers.Contract(contractAddress, abi, signer);
                await tradeContract.setInterestRate(inputRate, groupId);
                let cur_rate = await tradeContract.getInterestRate(groupId);
                setInterestRate(cur_rate);
                
            } else {
                console.log("Ethereum object does not exist");
            }
            setIsSettingInterest(false);
        }
        if(isSettingInterest==false && identity!==0) 
            return(
                <div onClick={()=>setIsSettingInterest(true)}>
                    {interestRate.toString()}
                </div>);
        return (
            <div className="container" onBlur={()=>handleBlur()}>
                <div>Change the Interest Rate</div>
                <div className="input-button-group">
                    <input autoFocus type="number" placeholder="Interest Rate" value={inputRate} onChange={e => setInputRate(e.target.value)} />
                    <button onClick={changeStatus}>Confirm</button>
                </div>
            </div>

        );

    }

    // if some memeber is unsatisified with other, he can inittiae a kicking vote
    const startExpel = async () => {
        const { ethereum } = window;
        if(ethereum) {
            const provider = new ethers.BrowserProvider(ethereum);
            const signer = await provider.getSigner();
            if(currentAccount == null) return;
            const tradeContract = new ethers.Contract(contractAddress, abi, signer);
            await tradeContract.startExpel(groupId, userAddress);
            setIsVotingExpel(true); 
        } else {
            console.log("Ethereum object does not exist");
        }
    };

    // other memebers can choose agree no not agree with the kicking vote    
    const voteExpel = async () => {
        const { ethereum } = window;
        if(ethereum) {
            const provider = new ethers.BrowserProvider(ethereum);
            const signer = await provider.getSigner();
            if(currentAccount == null) return;
            const tradeContract = new ethers.Contract(contractAddress, abi, signer);
            await tradeContract.voteExpel(groupId, voteResult);
        } else {
            console.log("Ethereum object does not exist");
        }
    };
    // const handleCreateVote = async (payload, args) => {
    //     try {
    //       const response = await fetch('http://localhost:5000/api/vote', {
    //         method: 'POST',
    //         headers: {
    //           'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(payload),
    //       });
    //       const data = await response.json();
    //       console.log(data);
    //       setIsVotingExpel(args);
    //     } catch (error) {
    //       console.error('Error in creating vote:', error);
    //     }
    // };
      
    // const handleUpdateVote = async (groupId, payload, args) => {
    //     try {
    //         const response = await fetch(`http://localhost:5000/api/vote/${groupId}`, {
    //         method: 'PUT',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(payload),
    //         });
    //         const data = await response.json();
    //         console.log(data);
    //         // setParams(args); // not needed
    //     } catch (error) {
    //         console.error(`Error in updating vote for groupId ${groupId}:`, error);
    //     }
    // };
      
    // const startExpel = async () => {
    //     const { ethereum } = window;
    //     if(ethereum) {
    //         const provider = new ethers.BrowserProvider(ethereum);
    //         const signer = await provider.getSigner();
    //         if(currentAccount == null) return;
    //         // const tradeContract = new ethers.Contract(contractAddress, abi, signer);
    //         // await tradeContract.startExpel(groupId, userAddress);
    //         // setIsVotingExpel(true);
    //         const payload = {groupId}  //empty json object
    //         const args = true // to setIsVotingExpel to true when success.
    //         handleCreateVote(payload, args)

    //     } else {
    //         console.log("Ethereum object does not exist");
    //     }
    // };
    
    // const voteExpel = async () => {
    //     const { ethereum } = window;
    //     if(ethereum) {
    //         const provider = new ethers.BrowserProvider(ethereum);
    //         const signer = await provider.getSigner();
    //         if(currentAccount == null) return;
    //         // const tradeContract = new ethers.Contract(contractAddress, abi, signer);
    //         // await tradeContract.voteExpel(groupId, voteResult);
    //         const payload = {groupId, [signer]:voteResult}  //voteResult is boolean
    //         const args = true // not needed
    //         handleUpdateVote(groupId, payload, args)
    //     } else {
    //         console.log("Ethereum object does not exist");
    //     }
    // };
   
    //every memeber in the group can apply for the waitlist if the want the amount of money at that month
    const applyBorrow = async () => {
        const { ethereum } = window;
        if(ethereum) {
            const provider = new ethers.BrowserProvider(ethereum);
            const signer = await provider.getSigner();
            if(currentAccount == null) return;
            const tradeContract = new ethers.Contract(contractAddress, abi, signer);
            await tradeContract.applyBorrow(groupId);
        } else {
            console.log("Ethereum object does not exist");
        }
    };

    //The random chosen borrower need to return the money he borrowed
    const returnMoney = async () => {
        const { ethereum } = window;
        if(ethereum) {
            const provider = new ethers.BrowserProvider(ethereum);
            const signer = await provider.getSigner();
            if(currentAccount == null) return;
            const tradeContract = new ethers.Contract(contractAddress, abi, signer);
            await tradeContract.repay(groupId, repayAmount);
            setIsRepaying(false);
        } else {
            console.log("Ethereum object does not exist");
        }
    };

    // This reset monthly event like kicking vote or money borrow applications, only group manager can do
    const resetMonthlyEvent = async () => {
        const { ethereum } = window;
        if(ethereum) {
            const provider = new ethers.BrowserProvider(ethereum);
            const signer = await provider.getSigner();
            if(currentAccount == null) return;
            const tradeContract = new ethers.Contract(contractAddress, abi, signer);
            await tradeContract.resetMonthlyEvent(groupId);
        } else {
            console.log("Ethereum object does not exist");
        }
    };

    //only group manager can close the application, after closing no one can apply for the borrower this month
    const closeApplication = async () => {
        const { ethereum } = window;
        if(ethereum) {
            const provider = new ethers.BrowserProvider(ethereum);
            const signer = await provider.getSigner();
            if(currentAccount == null) return;
            const tradeContract = new ethers.Contract(contractAddress, abi, signer);
            await tradeContract.closeApplication(groupId);
        } else {
            console.log("Ethereum object does not exist");
        }
    };

    //get the borrower's acccount address from the smart caontract
    const getBorrower = async () => {
        const { ethereum } = window;
        if(ethereum) {
            const provider = new ethers.BrowserProvider(ethereum);
            const signer = await provider.getSigner();
            if(currentAccount == null) return;
            const tradeContract = new ethers.Contract(contractAddress, abi, signer);
            let borrower_address = await tradeContract.getBorrowers(groupId);
            setBorrower(borrower_address);
        } else {
            console.log("Ethereum object does not exist");
        }
    };

    //once the certain time period is up, gorup manager should click the button and excute this function to return all money back to members' accounts    
    const returnSaving = async () => {
        const { ethereum } = window;
        if(ethereum) {
            const provider = new ethers.BrowserProvider(ethereum);
            const signer = await provider.getSigner();
            if(currentAccount == null) return;
            const tradeContract = new ethers.Contract(contractAddress, abi, signer);
            await tradeContract.returnSavings(groupId);
        } else {
            console.log("Ethereum object does not exist");
        }
    };

    useEffect(() => {
        try{
            const { ethereum } = window;
            checkWalletIsConnected();
            if (groupId === null || identity === null) {
                navigate('/');
            }
            if(currentAccount)
            checkUserAccount();
            getBalance();
            getInterest();
            getMonthlyPayment();
            getBorrower();
            //console.log(interestRate);
            //alert(interestRate);
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
        }catch(err){
            console.log(err)
        }

    }, [currentAccount,name,interestRate,monthlyMoney,balance,location.search])

    return (
        <div className="outerDiv">
           <h1>Group Detail Page</h1>
            {!(groupId === null || identity === null) && 
            <>
                <div className="groupinfo">
                    <div className="inner-container">
                        <div className="info-row">
                            <div className="info-label">Group ID: </div>
                            <div className="info-value">{groupId}</div>
                        </div>
                        <div className="info-row">
                            <div className="info-label">Identity: </div>
                            <div className="info-value">{identity ==0 ? "Member" : "Owner"}</div>
                        </div>
                        <div className="info-row">
                            <div className="info-label">Your current balance is :</div>
                            <div className="info-value">{balance.toString()}</div>
                        </div>
                        <div className="info-row">
                            <div className="info-label">Members: </div>
                            <div className="info-value">
                                <ul>
                                    <li> some functions to list memebers details</li>
                                    <li> Member 1</li>
                                </ul>
                            </div>
                        </div>
                        <div className="info-row">
                            <div className="info-label">Current Interest Rate is</div>
                            <div className="info-value"><InputComponent/></div>
                        </div>
                        <div className="info-row">
                            <div className="info-label">Everyone needs to deposit: </div>
                            <div className="info-value">{monthlyMoney.toString()}</div>
                        </div>
                        <div className="info-row">
                            <div className="info-label">Borrower: </div>
                            <div className="info-value">{borrower.toString()}</div>
                        </div>
                    </div>
                </div>
                {identity === "1" && 
                    <div className="ownerFunctions">
                        <h2>Group Owner Functions</h2>

                        <div className="firstThreeButtons">
                            <div style={{ display: 'inline-block', marginRight: '20px' }}>
                                <button className='cta-button mint-nft-button' onClick={resetMonthlyEvent}>Reset Monthly Event</button>
                            </div>
                            <div style={{ display: 'inline-block', marginRight: '20px' }}>
                                <button className='cta-button mint-nft-button' onClick={closeApplication}>Close Borrow Application</button>
                            </div>
                            <div style={{ display: 'inline-block', marginRight: '20px' }}>
                                <button className='cta-button mint-nft-button' onClick={returnSaving}>Return Saving</button>
                            </div>
                        </div>
                        <hr className="grey-line" />
                        <div className="setMonthlyMoney">
                            <button className='cta-button mint-nft-button' onClick={() => setIsSettingPayment(true)}>Set Monthly Money Amount</button>
                            {isSettingPayment && (
                                <div>
                                    <div>
                                        <input type="number" placeholder="Monthly Money" value={inputMoney} onChange={e => setInputMoney(e.target.value)} />
                                        <button onClick={setMonthlyPayment}>Confirm</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                }
                <div className="memberFunctions">
                    <h2>Group Member Functions</h2>         
                    <div className="buttonContainer">
                        <button onClick={makePayment} className='cta-button mint-nft-button'>Make Term (Monthly) Deposit</button>
                        <button onClick={applyBorrow} className='cta-button mint-nft-button'>Apply waitlist</button>

                    </div>
                    <hr className="grey-line" />
                    <div className="setMonthlyMoneyGroup">
                        <div className="setMonthlyMoney">
                            <button className='cta-button mint-nft-button' onClick={() => setIsRepaying(true)}>Repay Loan</button>
                            {isRepaying && (
                                <div>
                                    <input type="number" placeholder="Repay Amount" value={repayAmount} onChange={e => setRepayAmount(e.target.value)}/>
                                    <button onClick={returnMoney}>Confirm</button>
                                </div>
                            )}
                        </div>

                        <div className="setMonthlyMoney">
                            <button className='cta-button mint-nft-button' onClick={() => setIsStartingExpel(true) } disabled={isVotingExpel}>Initiate Member Dismissal</button>
                            {isStartingExpel && (
                                <div className="setMonthlyMoney">
                                    <input type="text" placeholder="User Address" value={userAddress} onChange={e => setUserAddress(e.target.value)}/>
                                    <button onClick={startExpel}>Confirm</button>
                                </div>
                            )}
                        </div>

                        <div className="setMonthlyMoney">
                            <button className='cta-button mint-nft-button' onClick={() => setIsVotingExpel(true) } disabled={!isStartingExpel}>Vote</button>
                            {isVotingExpel && (
                                <div className="setMonthlyMoney">
                                    <div className="radioButtons">
                                        <label>
                                            <input type="radio" value={true} checked={voteResult === true} onChange={e => setVoteResult(true)}/> Yes
                                        </label>
                                        <label>
                                            <input type="radio" value={false} checked={voteResult === false} onChange={e => setVoteResult(false)}/> No
                                        </label>
                                    </div>
                                    <button onClick={voteExpel}>Confirm</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </>
            }
            <br></br>
            <br></br>
            <br></br>
            { (groupId === null || identity === null) && 
                <div className="overlay">
                    <div className="message">
                        <p>You must have a wallet to access this page</p>
                        <Link to="/">Go to Home</Link>
                    </div>
                </div>
            }



            <div>
                <img src={logo} onClick={handleGoPrevious} style={{cursor: "pointer"}}  width="50" height="50"/>
            </div>

        </div>

        

    );


}    