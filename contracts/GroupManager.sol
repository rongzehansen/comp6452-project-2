/// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./Interface.sol";

contract GroupManager is IGroupManager {
    
    struct Group {
        string      name;                   // username
        User        owner;
        User[]      borrowers;
        User        target;                 // target to dismiss
        Status      status;
        uint        interestRate;           // default 5%
        uint        monthlyPayment;
        uint        period;
        uint        balance;
        uint        maxUserIndex;
        uint        numUsers;
        mapping(uint => User) users;
        User[]      participants;
    }
    
    struct Status {
        bool        voteOpen;               // default false
        bool        depositOpen;            // default true
        bool        applicationOpen;        // default false
    }
    
    struct User {
        address     userAddress;
        uint        savings;
        bool        hasDeposited;
        bool        hasBorrowed;
        bool        hasVoted;
        bool        vote;
        uint        loan;
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
    
    event db_createGroup(
        uint index,
        string name, 
        address owner,       
        Status status,
        uint interestRate,
        uint monthlyPayment,
        uint period,
        uint timeCreated
    );
    
    event db_updateStatus(
        uint index,
        bool voteOpen,
        bool depositOpen,
        bool applicationOpen
    );
    
    event db_updateInterestRate(
        uint index,
        uint interestRate
    );
    
    event db_updateMonthlyPayment(
        uint index,
        uint monthlyPayment
    );
    
    event db_updatePeriod(
        uint index,
        uint period
    );
    
    function setAccountManager(address payable otherContractAddress) public groupManagerRestricted {
        accountManagerAddress = otherContractAddress;
        accountManagerContract = IAccountManager(accountManagerAddress);
    }
    
    function debug_getUser(
        uint group,
        uint index
    ) public view groupManagerRestricted returns (User memory user) {
        require(0 < group && group <= numGroups, "Invalid group index");
        return groups[group].users[index];
    }
    
    function createGroup(
        address user, 
        string memory name
    ) public accountManagerRestricted returns (uint) {
        Group storage g = groups[++numGroups];
        g.name = name;
        Status memory s;
        s.voteOpen = false;
        s.depositOpen = true;
        s.applicationOpen = false;
        g.interestRate = 5;
        g.monthlyPayment = 0;
        g.period = 0;
        g.balance = 0;
        g.maxUserIndex = 0;
        g.numUsers = 0;
        g.status = s;
        addUser(user, numGroups);
        g.owner = g.users[g.maxUserIndex];
        emit db_createGroup(numGroups, g.name, user, g.status, g.interestRate, g.monthlyPayment, g.period, block.timestamp);
        return numGroups;
    }
    
    function addUser(
        address user, 
        uint group
    ) public accountManagerRestricted {
        require(0 < group && group <= numGroups, "Invalid group index");
        require(getUser(user, group) == 0, "User already exists");
        require(groups[group].status.depositOpen, "Cannot add user when deposit is close");
        User memory u;
        u.userAddress = user;
        u.savings = 0;
        u.hasDeposited = false;
        u.hasBorrowed = false;
        u.hasVoted = false;
        u.vote = false;
        u.loan = 0;
        groups[group].users[++groups[group].maxUserIndex] = u;
        groups[group].numUsers++;
    }
    
    function removeUser(
        address user,
        uint group
    ) private {
        require(0 < group && group <= numGroups, "Invalid group index");
        
        uint index = getUser(user, group);
        require(0 < index && index <= groups[group].maxUserIndex, "Invalid user index");
        
        //
        //require(groups[group].users[index].userAddress != groups[group].owner.userAddress, "Cannot remove the owner of this group");
        //require(getBorrorwer(user, group) == -1, "Cannot remove the borrower of this group");
        
        if (groups[group].users[index].savings > 0) {
            //require(groups[group].balance >= groups[group].users[index].savings, "Insufficient amount of group balance to pay the user");
            groups[group].balance -= groups[group].users[index].savings;
            balance -= groups[group].users[index].savings;
            //pay(accountManagerAddress, groups[group].users[index].savings);
            accountManagerContract.getFundFromGroupManager{value: groups[group].users[index].savings}(user);
        }
        
        delete groups[group].users[index];
        groups[group].numUsers--;
        accountManagerContract.leaveGroup(group, user);
    }
    
    function voteDismiss(
        address initiator,
        address target,
        uint group
    ) public accountManagerRestricted {
        require(0 < group && group <= numGroups, "Invalid group index");
        uint index = getUser(target, group);
        require(0 < index && index <= groups[group].maxUserIndex, "Target user not in the group");
        require(!groups[group].status.voteOpen, "Vote is open");
        
        require(target != groups[group].owner.userAddress, "Cannot dismiss the owner of this group");
        require(getBorrorwer(target, group) == -1, "Cannot dismiss the borrower of this group");
        
        require(initiator != target, "Cannot dismiss yourself");
        
        require(groups[group].balance >= groups[group].users[index].savings, "Insufficient amount of group balance to pay the user if dismissed");
        
        groups[group].target = groups[group].users[index];
        groups[group].status.voteOpen = true;
        emit db_updateStatus(group, groups[group].status.voteOpen, groups[group].status.depositOpen, groups[group].status.applicationOpen);
        vote(initiator, group, true);
    }
    
    function vote(
        address user,
        uint group,
        bool result
    ) public accountManagerRestricted {
        require(0 < group && group <= numGroups, "Invalid group index");
        uint index = getUser(user, group);
        require(0 < index && index <= groups[group].maxUserIndex, "Invalid user index");
        require(!groups[group].users[index].hasVoted, "User already voted");
        require(user != groups[group].target.userAddress, "Target user cannot participate voting process");
        groups[group].users[index].hasVoted = true;
        groups[group].users[index].vote = result;
        uint numYes = 0;
        if (hasEveryoneVoted(group)) {
            for (uint i = 1; i <= groups[group].maxUserIndex; i++) {
                if (groups[group].users[i].vote && groups[group].users[i].userAddress != address(0)) {
                    numYes++;
                }
                groups[group].users[i].vote = false;
                groups[group].users[i].hasVoted = false;
            }
            if (numYes / (groups[group].numUsers - 1) * 100 > 50) {
                removeUser(groups[group].target.userAddress, group);
            }
            delete groups[group].target;
            groups[group].status.voteOpen = false;
            emit db_updateStatus(group, groups[group].status.voteOpen, groups[group].status.depositOpen, groups[group].status.applicationOpen);
        }
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
    ) public accountManagerRestricted {
        require(0 < group && group <= numGroups, "Invalid group index");
        //require(msg.sender == groups[group].owner.userAddress, "You are not the owner of this group");
        require(interestRate > 0, "Interest rate needs to be higher than 0");
        groups[group].interestRate = interestRate;
        emit db_updateInterestRate(group, interestRate);
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
    ) public accountManagerRestricted {
        require(0 < group && group <= numGroups, "Invalid group index");
        //require(msg.sender == groups[group].owner.userAddress, "You are not the owner of this group");
        require(period > 0, "Period needs to be greater than 0");
        groups[group].period = period;
        emit db_updatePeriod(group, period);
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
    ) public accountManagerRestricted {
        require(0 < group && group <= numGroups, "Invalid group index");
        //require(msg.sender == groups[group].owner.userAddress, "You are not the owner of this group");
        require(monthlyPayment > 0, "Monthly payment needs to be higher than 0");
        groups[group].monthlyPayment = monthlyPayment;
        emit db_updateMonthlyPayment(group, monthlyPayment);
    }
    
    function openApplication(
        uint group
    ) public accountManagerRestricted {
        require(0 < group && group <= numGroups, "Invalid group index");
        //require(msg.sender == groups[group].owner.userAddress, "You are not the owner of this group");
        
        groups[group].status.applicationOpen = true;
        emit db_updateStatus(group, groups[group].status.voteOpen, groups[group].status.depositOpen, groups[group].status.applicationOpen);
    }
    
    function closeApplication(
        uint group
    ) public accountManagerRestricted {
        require(0 < group && group <= numGroups, "Invalid group index");
        //require(msg.sender == groups[group].owner.userAddress, "You are not the owner of this group");
        
        groups[group].status.applicationOpen = false;
        emit db_updateStatus(group, groups[group].status.voteOpen, groups[group].status.depositOpen, groups[group].status.applicationOpen);
        makeLoanTransfer(group);
    }
    
    function joinWaitingList(
        uint group,
        address user
    ) public accountManagerRestricted {
        require(groups[group].status.applicationOpen, "Application is not open");
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
        require(!groups[group].status.applicationOpen, "Application is still open");
        uint numParticipants = groups[group].participants.length;
        uint index = random(numParticipants);
        
        delete groups[group].participants;
        
        return index;
    }
    
    function makeLoanTransfer(
        uint group
    ) private {
        require(0 < group && group <= numGroups, "Invalid group index");
        require(!groups[group].status.depositOpen, "Deposit is still open");
        uint index = getApplicationWinner(group);
        User storage u = groups[group].users[index];
        require(u.hasBorrowed == false, "You have already recieved the loan");
        groups[group].borrowers.push(u);
        //pay(accountManagerAddress, groups[group].monthlyPayment * groups[group].numUsers);
        // external call
        accountManagerContract.getMoney{value: groups[group].monthlyPayment * groups[group].numUsers}(u.userAddress);
        u.hasBorrowed = true;
        u.loan = groups[group].monthlyPayment * groups[group].numUsers;
        groups[group].balance -= groups[group].monthlyPayment * groups[group].numUsers;
        balance -= groups[group].monthlyPayment * groups[group].numUsers;
    }
    
    function makeTermDeposit(
        address sender,
        uint group
    ) public accountManagerRestricted payable {
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
            groups[group].status.depositOpen = false;
            emit db_updateStatus(group, groups[group].status.voteOpen, groups[group].status.depositOpen, groups[group].status.applicationOpen);
        }
        
        if (getBorrorwer(sender, group) != -1) {
            uint amount = groups[group].monthlyPayment * groups[group].interestRate / 100;
            require(accountManagerContract.getBalance(u.userAddress) >= amount * (groups[group].numUsers - 1), "You do not have sufficient amount of money to release");
            for (uint i = 1; i <= groups[group].maxUserIndex; i++) {
                address recipient = groups[group].users[i].userAddress;
                if (recipient != u.userAddress && recipient != address(0)) {
                    // external call
                    accountManagerContract.releaseFunds(u.userAddress, recipient, amount);
                }
            }
        }
    }
    
    function getBorrorwer(
        address user,
        uint group
    ) private view returns (int) {
        require(0 < group && group <= numGroups, "Invalid group index");
        int index = -1;
        for (uint i = 0; i < groups[group].borrowers.length; i++) {
            if (groups[group].borrowers[i].userAddress == user) {
                index = int(i);
                break;
            }
        }
        return index;
    }
    
    function hasEveryoneVoted(
        uint group
    ) private view returns(bool) {
        require(0 < group && group <= numGroups, "Invalid group index");
        for (uint i = 1; i <= groups[group].maxUserIndex; i++) {
            if (groups[group].users[i].userAddress != address(0)) {
                if (!groups[group].users[i].hasVoted && groups[group].users[i].userAddress != groups[group].target.userAddress) {
                    return false;
                }
            }
        }
        return true;
    }
    
    function hasEveryoneDeposited(
        uint group
    ) private view returns(bool) {
        require(0 < group && group <= numGroups, "Invalid group index");
        for (uint i = 1; i <= groups[group].maxUserIndex; i++) {
            if (groups[group].users[i].userAddress != address(0)) {
                if (!groups[group].users[i].hasDeposited) {
                    return false;
                }
            }
        }
        return true;
    }
    
    function repayLoan(
        address sender,
        uint group
    ) public accountManagerRestricted payable {
        require(0 < group && group <= numGroups, "Invalid group index");
        uint user = getUser(sender, group);
        require(0 < user && user <= groups[group].maxUserIndex, "Invalid user index");
        int index = getBorrorwer(sender, group);
        require(index != -1, "You are not the borrower");
        User storage u = groups[group].users[user];
        require(msg.value == u.loan, "Amount received does not equal to your loan");
        groups[group].borrowers[uint(index)] = groups[group].borrowers[groups[group].borrowers.length - 1];
        groups[group].borrowers.pop();
        u.loan = 0;
        
        groups[group].balance += msg.value;
        balance += msg.value;
    }
    
    function returnSavings(
        uint group
    ) public returns (address[] memory, uint[] memory) {
        require(0 < group && group <= numGroups, "Invalid group index");
        uint total = 0;
        uint j = 0;
        address[] memory users = new address[](groups[group].numUsers);
        uint[] memory savings = new uint[](groups[group].numUsers);
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
        accountManagerContract.getFundFromGroupManager{value: total}();
        //pay(accountManagerAddress, total);
        return (users, savings);
    }
    
    function reset(
        uint group
    ) public {
        require(0 < group && group <= numGroups, "Invalid group index");
        groups[group].status.voteOpen = false;
        groups[group].status.depositOpen = true;
        groups[group].status.applicationOpen = false;
        emit db_updateStatus(group, groups[group].status.voteOpen, groups[group].status.depositOpen, groups[group].status.applicationOpen);
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
        uint randomnumber = (uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce))) % x) + 1;
        nonce++;
        return randomnumber;
    }
    
    /**
     * @notice Only the manager can do
     */
    modifier groupManagerRestricted() {
        require(msg.sender == manager, "Can only be executed by the group manager");
        _;
    }
    
    modifier accountManagerRestricted() {
        require(msg.sender == accountManagerAddress, "Can only be executed by the account manager");
        _;
    }
}
