// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;



contract AccountManager{



    constructor(){
        manager=msg.sender;
    }
    

    struct User {
        string name;
        uint256 balance;
        address userAddress;
        uint groupId;
    }

    IGroupManager private groupManagerAddress;


    
    mapping(address=>User) private users;
    uint private numUsers;
    uint private group;
    address private manager;
    address private groupManagerContract;


    fallback() external payable {
        deposit();
    }


    receive() external payable {
        deposit();
    }

    event Deposit(address sender, uint amount);
    event Transfer(address sender, address receiver, uint amount);
    function deposit() public haveAccount() payable {
        
        emit Deposit(msg.sender, msg.value);
        users[msg.sender].balance += msg.value;
    }


    function transfer(uint amount,uint groupNum) public restricted payable {
        require(users[msg.sender].balance >= amount, "Insufficient funds");
        emit Transfer(msg.sender, groupManagerContract, amount);
        users[msg.sender].balance -= amount;
        groupManagerAddress.deposit{value:amount}(msg.sender, groupNum);
       
    }


    function getBalance(address userAddress) public view haveAccount() returns (uint256) {
        return users[userAddress].balance;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function getUserInfo(address userAddress) public view restricted returns(string memory){
        User storage temp=users[userAddress];
        return (temp.name);
    }

    function createAccount(address userAddress,string memory name)public returns(bool,uint)  {
        if(bytes(users[userAddress].name).length!=0) return (false,numUsers);
        if(bytes(name).length==0 || address(0) == userAddress) return (false,numUsers);
        User memory f;
        f.name = name;
        f.groupId = 0;
        users[userAddress] = f;
        numUsers++;
        return (true,numUsers);
    }

    function setManagerContract(address managerContract) public restricted {
        groupManagerAddress= IGroupManager(managerContract);
        groupManagerContract = managerContract;
    }

    modifier restricted () {
        require ( msg.sender == manager , "Can only be executed by the manager");
        _;
    }

    modifier haveAccount(){
        require(bytes(users[msg.sender].name).length != 0, "Account does not exist");
        _;
    }



}

interface IAccountManager {
    function getUserInfo(address userAddress) external view returns (string memory);
    function voteDismiss(address userAddress) external returns(bool);
}

interface IGroupManager {
    function deposit( address sender,uint group) external payable;
}