// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Interface.sol";
contract AccountManager {
    constructor() {
        manager = msg.sender;
    }

    enum Identity {
        member,
        owner
    }
    struct GroupInfo {
        uint256 id;
        Identity identity;
    }

    struct User {
        string name;
        uint256 balance;
        mapping(uint256 => GroupInfo) groupIdentity;
        GroupInfo [] groupInfo;
    }

    IGroupManager private groupManagerAddress;

    mapping(address => User) private users;
    uint256 private numUsers;
    uint256 private group;
    address private manager;
    address private groupManagerContract;
    uint testIndex=0;
    fallback() external payable {
        deposit();
    }

    receive() external payable {
        deposit();
    }

    event Deposit(address sender, uint256 amount);
    event Transfer(address sender, address receiver, uint256 amount);

    function deposit() public payable haveAccount {
        emit Deposit(msg.sender, msg.value);
        users[msg.sender].balance += msg.value;
    }


    function getGroupsInfo()public haveAccount view returns(GroupInfo[] memory){
        return users[msg.sender].groupInfo;
    }

    function createGroup(string memory groupName)public haveAccount{
        GroupInfo  memory temp ;
        temp.id=groupManagerAddress.createGroup(msg.sender,groupName);
        temp.identity=Identity.owner;
        users[msg.sender].groupInfo.push(temp);
        users[msg.sender].groupIdentity[temp.id].id=temp.id;
        users[msg.sender].groupIdentity[temp.id].identity=Identity.owner;
    }
    
    /* TODO:
    //Vote expel user
    function voteExpel(uint groupId,address userAddress,bool result) public returns (bool) {
        //TODO 等一个接口函数
    }

    //Start a expel event
    function startExpel(uint groupId,address userAddress) public {
        voteExpel(groupId,userAddress,true);
    }
    */
    function leaveGroup(uint groupId, address userAddress) external {
        for(uint i=0; i< users[userAddress].groupInfo.length;i++){
            if(users[userAddress].groupInfo[i].id==groupId){
                users[userAddress].groupInfo[i]=users[userAddress].groupInfo[users[userAddress].groupInfo.length-1];
                users[userAddress].groupInfo.pop();
            }
        }
    }

    function getMoney(address targetUser, uint amount)external {
        users[targetUser].balance+=amount;
    }

    //User receive money
    function deposit(address target) external payable {
        emit Deposit(msg.sender, msg.value);
        users[target].balance += msg.value;
    }

    //User withdraw from account
    function withdraw(uint256 amount) public haveAccount {
        require(users[msg.sender].balance >= amount, "Insufficient funds");
        payable(msg.sender).transfer(amount);
        users[msg.sender].balance -= amount;
    }


    //Set interest rate
    function setInterestRate(uint256 interestRate, uint256 groupId)
        public
        haveAccount
    {
        require(
            users[msg.sender].groupIdentity[groupId].id != 0 &&
                users[msg.sender].groupIdentity[groupId].identity ==
                Identity.owner,
            "Sender is not manager"
        );
        groupManagerAddress.setInterestRate(groupId, interestRate);
    }

    //Apply for borrower
    function applyBorrow(uint groupId) public haveAccount {
        groupManagerAddress.joinWaitingList(groupId, msg.sender);
    }


    //Set Monthly payment
    function setMonthlyPaymentAmount(uint256 amount,uint groupId) public{
        groupManagerAddress.setMonthlyPayment(groupId,amount);
    }


    //Pay to group
    function monthlyPayment(uint256 groupId) public haveAccount {
        uint amount=groupManagerAddress.getMonthlyPayment(groupId);
        require(users[msg.sender].balance >= amount, "Insufficient funds");
        emit Transfer(msg.sender, groupManagerContract, amount);
        groupManagerAddress.makeTermDeposit{value: amount}(msg.sender, groupId);
        users[msg.sender].balance -= amount;
        
    }

    function participateVote(uint groupId)public haveAccount{
        //TODO
    }

    //Add a user to group
    function addToGroup(uint256 groupId, address userAddress)
        public
        haveAccount
    {
        require(
            users[msg.sender].groupIdentity[groupId].id != 0 &&
                users[msg.sender].groupIdentity[groupId].identity ==
                Identity.owner,
            "Sender is not manager"
        );
        require(
            users[userAddress].groupIdentity[groupId].id == 0,
            "Account already joined this group"
        );
        GroupInfo memory temp;
        temp.id=groupId;
        temp.identity=Identity.member;
        users[userAddress].groupIdentity[groupId].identity = Identity.member;
        users[userAddress].groupIdentity[groupId].id = groupId;
        users[userAddress].groupInfo.push(temp);
        groupManagerAddress.addUser(userAddress, groupId);
    }

    //Return savings to members
    function returnSavings(uint256 groupId) public {
        require(
            bytes(users[msg.sender].name).length != 0,
            "Account does not exist"
        );
        require(
            users[msg.sender].groupIdentity[groupId].id != 0 &&
                users[msg.sender].groupIdentity[groupId].identity ==
                Identity.owner,
            "You are not the owner of the group"
        );
        (address[] memory tarUsers, uint[] memory savings)=groupManagerAddress.returnSavings(groupId);
       for(uint i=0;i< tarUsers.length;i++){
           users[tarUsers[i]].balance+=savings[i];
       }
    }

    //If sender is a borrower, pay interest to other member in the group
    function releaseFund(
        address senderAddress,
        address targetAddress,
        uint256 amount
    )  private{
        require(
            bytes(users[senderAddress].name).length != 0,
            "Account does not exist"
        );
        require(
            bytes(users[targetAddress].name).length != 0,
            "Account does not exist"
        );
        require(users[senderAddress].balance >= amount, "Insufficient funds");
        
        users[senderAddress].balance -= amount;
        users[targetAddress].balance += amount;
    }

    //Get user's balance
    function getBalance(address userAddress)
        public
        view
        haveAccount
        returns (uint256)
    {
        return users[userAddress].balance;
    }

    //Get contract balance
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    //Retrieve user's data
    function getUserInfo(address userAddress)
        public
        view
        returns (string memory)
    {
        User storage temp = users[userAddress];
        return (temp.name);
    }

    // Create user account
    function createAccount(address userAddress, string memory name)
        public
        returns (uint256)
    {
        require(
            bytes(users[userAddress].name).length == 0,
            "User already exsists"
        );
        require(
            bytes(name).length != 0 && address(0) != userAddress,
            "Invalid name or user address"
        );
        User storage f = users[userAddress];
        f.name = name;
        f.balance = 0;
        numUsers++;
        return numUsers;
    }

    //Set group manager contract, initiate group manager contract interface
    function setManagerContract(address managerContract) public restricted {
        groupManagerAddress = IGroupManager(managerContract);
        groupManagerContract = managerContract;
    }

    modifier restricted() {
        require(msg.sender == manager, "Can only be executed by the manager");
        _;
    }

    modifier haveAccount() {
        require(
            bytes(users[msg.sender].name).length != 0,
            "Account does not exist"
        );
        _;
    }
}

