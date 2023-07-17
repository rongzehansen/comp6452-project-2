/// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./Interface.sol";

contract GroupManager is IGroupManager {
    
    struct Group {
        //uint        index;
        string      name;                   // username
        User        owner;
        User        borrower;
        bool        voteOpen;               // default false
        bool        depositOpen;            // default true
        bool        applicationOpen;        // default false
        uint        interestRate;           // default 5%
        uint        monthlyPayment;
        uint        period;
        uint        balance;
        uint        maxUserIndex;
        uint        numUsers;
        mapping(uint => User) users;
        User[]      participants;
    }
    
    struct User {
        address     userAddress;
        uint        savings;
        bool        hasDeposited;
        bool        hasBorrowed;
        //bool        requestLoan;
    }
    
    address payable accountManagerAddress;
    IAccountManager private accountManagerContract;
    
    uint nonce = 0;
    
    address public manager;
    uint public balance;
    
    uint public numGroups = 0;
    mapping(uint => Group) public groups;
    
    /**
     * @dev Set manager when contract starts
     */
    constructor() {
        manager = msg.sender; // Set contract creator as manager
    }
    
    function setAccountManager(address payable otherContractAddress) public restricted {
        accountManagerAddress = otherContractAddress;
        accountManagerContract = IAccountManager(accountManagerAddress);
    }
    
    function createGroup(
        address user, 
        string memory name
    ) public returns (uint) {
        Group storage g = groups[++numGroups];
        //g.index = numGroups;
        g.name = name;
        g.voteOpen = false;
        g.depositOpen = true;
        g.applicationOpen = false;
        g.interestRate = 5;
        g.monthlyPayment = 0;
        g.period = 0;
        g.balance = 0;
        g.maxUserIndex = 0;
        g.numUsers = 0;
        addUser(user, numGroups);
        g.owner = g.users[g.maxUserIndex];
        return numGroups;
    }
    
    function addUser(
        address user, 
        uint group
    ) public {
        require(0 < group && group <= numGroups, "Invalid group index");
        require(getUser(user, group) == 0, "User already exists");
        require(groups[group].depositOpen, "Cannot add user when deposit is close");
        User memory u;
        u.userAddress = user;
        u.savings = 0;
        u.hasDeposited = false;
        u.hasBorrowed = false;
        //u.requestLoan = false;
        groups[group].users[++groups[group].maxUserIndex] = u;
        groups[group].numUsers++;
    }
    
    function removeUser(
        address user,
        uint group
    ) public {
        require(0 < group && group <= numGroups, "Invalid group index");
        
        uint index = getUser(user, group);
        require(0 < index && index <= groups[group].maxUserIndex, "Invalid user index");
        
        //
        require(groups[group].users[index].userAddress != groups[group].owner.userAddress, "Cannot remove the owner of the group");
        
        delete groups[group].users[index];
        groups[group].numUsers--;
    }
    
    function getUser(
        address user, 
        uint group
    ) private view returns (uint) {
        require(0 < group && group <= numGroups, "Invalid group index");
        uint index = 0;
        for (uint i = 0; i <= groups[group].maxUserIndex; i++) {
            if (groups[group].users[i].userAddress == user) {
                index = i;
                break;
            }
        }
        return index;
    }
    
    function getParticipant(
        address user, 
        uint group
    ) private view returns (int) {
        require(0 < group && group <= numGroups, "Invalid group index");
        int index = -1;
        for (uint i = 0; i < groups[group].participants.length; i++) {
            if (groups[group].participants[i].userAddress == user) {
                index = int(i);
                break;
            }
        }
        return index;
    }
    
    function getInterestRate(
        uint group
    ) public view returns (uint) {
        require(0 < group && group <= numGroups, "Invalid group index");
        return groups[group].interestRate;
    }
    
    function setInterestRate(
        uint group,
        uint interestRate
    ) public {
        require(0 < group && group <= numGroups, "Invalid group index");
        //require(msg.sender == groups[group].owner.userAddress, "You are not the owner of this group");
        require(interestRate > 0, "Interest rate needs to be higher than 0");
        groups[group].interestRate = interestRate;
    }
    
    function getPeriod(
        uint group
    ) public view returns (uint) {
        require(0 < group && group <= numGroups, "Invalid group index");
        return groups[group].period;
    }
    
    function setPeriod(
        uint group,
        uint period
    ) public {
        require(0 < group && group <= numGroups, "Invalid group index");
        //require(msg.sender == groups[group].owner.userAddress, "You are not the owner of this group");
        require(period > 0, "Period needs to be greater than 0");
        groups[group].period = period;
    }
    
    function getMonthlyPayment(
        uint group
    ) public view returns (uint) {
        require(0 < group && group <= numGroups, "Invalid group index");
        return groups[group].monthlyPayment;
    }
    
    function setMonthlyPayment(
        uint group,
        uint monthlyPayment
    ) public {
        require(0 < group && group <= numGroups, "Invalid group index");
        //require(msg.sender == groups[group].owner.userAddress, "You are not the owner of this group");
        require(monthlyPayment > 0, "Monthly payment needs to be higher than 0");
        groups[group].monthlyPayment = monthlyPayment;
    }
    
    function openApplication(
        uint group
    ) public {
        require(0 < group && group <= numGroups, "Invalid group index");
        //require(msg.sender == groups[group].owner.userAddress, "You are not the owner of this group");
        
        groups[group].applicationOpen = true;
    }
    
    function closeApplication(
        uint group
    ) public {
        require(0 < group && group <= numGroups, "Invalid group index");
        //require(msg.sender == groups[group].owner.userAddress, "You are not the owner of this group");
        
        groups[group].applicationOpen = false;
    }
    
    function joinWaitingList(
        uint group,
        address user
    ) public {
        require(groups[group].applicationOpen, "Application is not open");
        uint index = getUser(user, group);
        require(index != 0, "User does not exist");
        require(getParticipant(user, group) == -1, "User has already joined the waiting list");
        User memory u = groups[group].users[index];
        require(u.hasBorrowed == false, "User has borrowed before");
        groups[group].participants.push(groups[group].users[index]);
    }
    
    function getApplicationWinner(
        uint group
    ) private returns (uint) {
        require(0 < group && group <= numGroups, "Invalid group index");
        require(!groups[group].applicationOpen, "Application is still open");
        uint numParticipants = groups[group].participants.length;
        uint index = random(numParticipants);
        
        delete groups[group].participants;
        
        return index;
    }
    
    function makeLoanTransfer(
        uint group
    ) public {
        require(0 < group && group <= numGroups, "Invalid group index");
        require(!groups[group].depositOpen, "Deposit is still open");
        uint index = getApplicationWinner(group);
        User storage u = groups[group].users[index];
        require(u.hasBorrowed == false, "You have already recieved the loan");
        groups[group].borrower = u;
        pay(accountManagerAddress, groups[group].monthlyPayment * groups[group].numUsers);
        // external call
        accountManagerContract.getMoney(u.userAddress, groups[group].monthlyPayment * groups[group].numUsers);
        u.hasBorrowed = true;
        groups[group].balance -= groups[group].monthlyPayment * groups[group].numUsers;
        balance -= groups[group].monthlyPayment * groups[group].numUsers;
    }
    
    function makeTermDeposit(
        address sender,
        uint group
    ) public payable {
        require(0 < group && group <= numGroups, "Invalid group index");
        
        uint index = getUser(sender, group);
        require(0 < index && index <= groups[group].maxUserIndex, "Invalid user index");
        
        User storage u = groups[group].users[index];
        //require(accountManagerContract.getBalance(u.userAddress) >= msg.value, "You do not have sufficient amount of money to deposit");
        require(msg.value == groups[group].monthlyPayment, "Amount received does not equal to monthlyPayment");
        require(u.hasDeposited == false, "You have already deposited this month");
        groups[group].balance += msg.value;
        balance += msg.value;
        u.savings += msg.value;
        
        u.hasDeposited = true;
        
        if (hasEveryoneDeposited(group)) {
            groups[group].depositOpen = false;
        }
        
        if (groups[group].borrower.userAddress == u.userAddress) {
            uint amount = groups[group].monthlyPayment * groups[group].interestRate / 100;
            require(accountManagerContract.getBalance(u.userAddress) >= amount * (groups[group].numUsers - 1), "You do not have sufficient amount of money to release");
            for (uint i = 0; i <= groups[group].maxUserIndex; i++) {
                address recipient = groups[group].users[i].userAddress;
                if (recipient != u.userAddress) {
                    // external call
                    accountManagerContract.releaseFunds(u.userAddress, recipient, amount);
                }
            }
        }
    }
    
    function hasEveryoneDeposited(
        uint group
    ) private view returns(bool) {
        require(0 < group && group <= numGroups, "Invalid group index");
        for (uint i = 1; i <= groups[group].maxUserIndex; i++) {
            if (!groups[group].users[i].hasDeposited) {
                return false;
            }
        }
        return true;
    }
    
    function returnSavings(
        uint group
    ) public returns (address[] memory users, uint[] memory savings) {
        require(0 < group && group <= numGroups, "Invalid group index");
        uint total = 0;
        uint j = 0;
        users = new address[](0);
        savings = new uint[](0);
        for (uint i = 0; i <= groups[group].maxUserIndex; i++) {
            if (groups[group].users[i].userAddress != address(0)) {
            
                users[j] = groups[group].users[i].userAddress;
                savings[j] = groups[group].users[i].savings;
                j++;
                total += groups[group].users[i].savings;
                
                groups[group].balance -= groups[group].users[i].savings;
                balance -= groups[group].users[i].savings;
                groups[group].users[i].savings = 0;
            }
        }
        pay(accountManagerAddress, total);
        /*
        if (groups[group].balance > 0) {  }
        */
        return (users, savings);
    }
    
    function reset(
        uint group
    ) public {
        require(0 < group && group <= numGroups, "Invalid group index");
        groups[group].voteOpen = false;
        groups[group].depositOpen = true;
        groups[group].applicationOpen = false;
        for (uint i = 0; i <= groups[group].maxUserIndex; i++) {
            groups[group].users[i].hasDeposited = false;
        }
    }
    
    function pay(address payable _contract, uint amount) public payable {
        // Forward the amount to the target contract
        (bool success,) = _contract.call{value: amount}("");
        require(success, "Failed to send Ether");
    }
    
    function random(uint x) private returns(uint) {
        uint randomnumber = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce))) % x;
        nonce++;
        return randomnumber;
    }
    
    /**
     * @notice Only the manager can do
     */
    modifier restricted() {
        require(msg.sender == manager, "Can only be executed by the manager");
        _;
    }
}
