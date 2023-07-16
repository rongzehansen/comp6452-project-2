// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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
        //uint256 balance;
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

    function createGroup()public haveAccount{
        
        GroupInfo  memory temp ;
        //temp.id=function call goes here
        temp.id=testIndex++;
        temp.identity=Identity.owner;
        users[msg.sender].groupInfo.push(temp);
        users[msg.sender].groupIdentity[temp.id].id=temp.id;
        users[msg.sender].groupIdentity[temp.id].identity=Identity.owner;
        

    }
    //Vote expel user
    function voteExpel(address userAddress) external returns (bool) {
        //TODO 等一个接口函数
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

    //transfer money to group manager
    function transfer(uint256 amount, uint256 groupNum) private {
        require(users[msg.sender].balance >= amount, "Insufficient funds");
        emit Transfer(msg.sender, groupManagerContract, amount);
        users[msg.sender].balance -= amount;
        groupManagerAddress.deposit{value: amount}(msg.sender, groupNum);
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
    function applyBorrow() public haveAccount {}


    //Set Monthly payment
    function setMonthlyPaymentAmount(uint256 amount,uint groupId) public{
        groupManagerAddress.setMonthlyPayment(groupId,amount);
    }


    //Pay to group
    function monthlyPayment(uint256 groupId) public haveAccount {
        require(
            groupManagerAddress.releaseFund(
                users[msg.sender].balance,
                msg.sender,
                groupId
            ),
            "Insufficient balance"
        );
        transfer(groupManagerAddress.getMonthlyPayment(groupId), groupId);
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
    function returnSavings(uint256 groupId, uint256 amount) public {
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
        transfer(amount, groupId);
        groupManagerAddress.returnSavings(groupId, amount);
    }

    //If sender is a borrower, pay interest to other member in the group
    function releaseFund(
        address senderAddress,
        address payable targetAddress,
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
        targetAddress.transfer(amount);
        users[senderAddress].balance -= amount;
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

interface IAccountManager {
    function getUserInfo(address userAddress)
        external
        view
        returns (string memory);

    function voteExpel(address userAddress) external returns (bool);

    function releaseFund(
        address senderAddress,
        address payable targetAddress,
        uint256 amount
    ) external payable;

    function deposit(address target) external payable;
}

interface IGroupManager {
    function deposit(address sender, uint256 group) external payable;

    function addUser(address user, uint256 group) external;

    function returnSavings(uint256 group, uint256 amount) external payable;

    function getInterestRate(uint256 group) external returns (uint256);

    function setInterestRate(uint256 group, uint256 interestRate) external;

    function releaseFund(
        uint256 balance,
        address target,
        uint256 groupId
    ) external returns (bool);

    function getMonthlyPayment(uint256 group) external view returns (uint256);

    function setMonthlyPayment(uint256 group, uint256 monthlyPayment) external;
}
