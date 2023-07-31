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
        GroupInfo[] groupInfo;
    }

    IGroupManager private groupManagerAddress;

    mapping(address => User) private users;
    uint256 private numUsers;
    uint256 private group;
    address private manager;
    address private groupManagerContract;
    uint256 testIndex = 0;

    fallback() external payable {
        deposit();
    }

    receive() external payable {
        deposit();
    }

    event Deposit(address sender, uint256 amount);
    event Transfer(address sender, address receiver, uint256 amount);

    //function to receive fund
    function deposit() public payable haveAccount {
        emit Deposit(msg.sender, msg.value);
        users[msg.sender].balance += msg.value;
    }

    //get groups info
    function getGroupsInfo()
        public
        view
        haveAccount
        returns (GroupInfo[] memory)
    {
        return users[msg.sender].groupInfo;
    }

    //create a new group
    function createGroup(string memory groupName) public haveAccount {
        GroupInfo memory temp;
        temp.id = groupManagerAddress.createGroup(msg.sender, groupName);
        temp.identity = Identity.owner;
        users[msg.sender].groupInfo.push(temp);
        users[msg.sender].groupIdentity[temp.id].id = temp.id;
        users[msg.sender].groupIdentity[temp.id].identity = Identity.owner;
    }

    //get interest rate
    function getInterestRate(uint groupId)public view returns(uint){
        return groupManagerAddress.getInterestRate(groupId);
    }

    //get monthly payment amount
    function getMonthlyPayment(uint groupId)public view returns(uint){
        return groupManagerAddress.getMonthlyPayment(groupId);
    }

    //do vote
    function voteExpel(uint256 groupId, bool result) public {
        groupManagerAddress.vote(msg.sender, groupId, result);
    }

    //get the borrower list
    function getBorrowers(uint groupId) public view  returns(address[] memory){
        return groupManagerAddress.getBorrorwers(groupId);
    }

    //start a expel event
    function startExpel(uint256 groupId, address userAddress) public {
        groupManagerAddress.voteDismiss(msg.sender, userAddress, groupId);
    }

    //for a user is expeled from from the group
    function leaveGroup(uint256 groupId, address userAddress) external {
        for (uint256 i = 0; i < users[userAddress].groupInfo.length; i++) {
            if (users[userAddress].groupInfo[i].id == groupId) {
                users[userAddress].groupInfo[i] = users[userAddress].groupInfo[
                    users[userAddress].groupInfo.length - 1
                ];
                users[userAddress].groupInfo.pop();
            }
        }
        users[userAddress].groupIdentity[groupId].id=0;
        users[userAddress].groupIdentity[groupId].identity=Identity.member;
    }

    //if user is a borrower, this is the function to repay the fund
    function repay(uint groupId,uint256 amount) public haveAccount{
        require(users[msg.sender].balance >= amount, "Insufficient funds");
        groupManagerAddress.repayLoan{value:amount}(msg.sender,groupId);
        users[msg.sender].balance-=amount;
    }

    //accept fund from group manager contract
    function getMoney(address targetUser) external payable {
        require(msg.sender==groupManagerContract,"Can only execute by group manager");
        users[targetUser].balance += msg.value;
    }

    //accept fund from group manager contract
    function getFundFromGroupManager() external payable{
        require(msg.sender==groupManagerContract,"Can only execute by group manager");
        emit Deposit(msg.sender, msg.value);
    }

    //accept fund from group manager contract (overload)
    function getFundFromGroupManager(address target) external payable{
        require(msg.sender==groupManagerContract,"Can only execute by group manager");
        emit Deposit(msg.sender, msg.value);
        users[target].balance+=msg.value;
    }

    //for group owner to reset monthly payment and open application for joining borrower waitlist
    function resetMonthlyEvent(uint groupId) public{
        require(
            users[msg.sender].groupIdentity[groupId].id != 0 &&
                users[msg.sender].groupIdentity[groupId].identity ==
                Identity.owner,
            "Sender is not manager"
        );
        groupManagerAddress.reset(groupId);
        groupManagerAddress.openApplication(groupId);
    }
    //close application for joining borrower waitlist
    function closeApplication(uint groupId) public{
        require(
            users[msg.sender].groupIdentity[groupId].id != 0 &&
                users[msg.sender].groupIdentity[groupId].identity ==
                Identity.owner,
            "Sender is not manager"
        );
        groupManagerAddress.closeApplication(groupId);
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
    function applyBorrow(uint256 groupId) public haveAccount {
        groupManagerAddress.joinWaitingList(groupId, msg.sender);
    }

    //Set Monthly payment
    function setMonthlyPaymentAmount(uint256 amount, uint256 groupId) public {
        groupManagerAddress.setMonthlyPayment(groupId, amount);
    }

    //Pay to group
    function monthlyPayment(uint256 groupId) public haveAccount {
        uint256 amount = groupManagerAddress.getMonthlyPayment(groupId);
        require(users[msg.sender].balance >= amount, "Insufficient funds");
        emit Transfer(msg.sender, groupManagerContract, amount);
        groupManagerAddress.makeTermDeposit{value: amount}(msg.sender, groupId);
        users[msg.sender].balance -= amount;
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
        temp.id = groupId;
        temp.identity = Identity.member;
        users[userAddress].groupIdentity[groupId].identity = Identity.member;
        users[userAddress].groupIdentity[groupId].id = groupId;
        users[userAddress].groupInfo.push(temp);
        groupManagerAddress.addUser(userAddress, groupId);
    }

    //Return savings to members
    function returnSavings(uint256 groupId) public {
        require(
            users[msg.sender].groupIdentity[groupId].id != 0 &&
                users[msg.sender].groupIdentity[groupId].identity ==
                Identity.owner,
            "You are not the owner of the group"
        );
        (
            address[] memory tarUsers,
            uint256[] memory savings
        ) = groupManagerAddress.returnSavings(groupId);
        for (uint256 i = 0; i < tarUsers.length; i++) {
            users[tarUsers[i]].balance += savings[i];
        }
    }

    //transfer address to string (debug purpose)
    function addressToString(address _addr) public pure returns(string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

    //If sender is a borrower, pay interest to other member in the group
    function releaseFunds(
        address senderAddress,
        address targetAddress,
        uint256 amount
    ) external {
        require(
            bytes(users[senderAddress].name).length != 0,
            string(abi.encodePacked("Sender ", addressToString(senderAddress), " does not exist"))
        );
        require(
            bytes(users[senderAddress].name).length != 0,
            string(abi.encodePacked("Target ", addressToString(targetAddress), " does not exist"))
        );
        require(users[senderAddress].balance >= amount, "Insufficient funds");

        users[senderAddress].balance -= amount;
        users[targetAddress].balance += amount;
    }

    //Get user's balance
    function getBalance(address userAddress)
        public
        view
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
