/// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract GroupManager {
    
    struct Group {
        uint        index;
        string      name;                   // username
        User        owner;
        User        borrower;
        bool        voteOpen;               // default false
        bool        depositOpen;            // default true
        bool        applicationOpen;        // default false
        uint        interestRate;           // default 5%
        uint        monthlyPayment;
        uint        balance;
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
    
    function createGroup(
        string memory name
    ) public {
        Group storage g = groups[++numGroups];
        g.index = numGroups;
        g.name = name;
        g.voteOpen = false;
        g.depositOpen = true;
        g.applicationOpen = false;
        g.interestRate = 5;
        g.monthlyPayment = 0;
        g.balance = 0;
        g.numUsers = 0;
        addUser(msg.sender, numGroups);
        g.owner = g.users[g.numUsers];
    }
    
    function addUser(
        address user, 
        uint group
    ) public {
        require(0 < group && group <= numGroups, "Invalid group index");
        require(getUser(user, group) == 0, "User already exists");
        User memory u;
        u.userAddress = user;
        u.savings = 0;
        u.hasDeposited = false;
        u.hasBorrowed = false;
        //u.requestLoan = false;
        groups[group].users[++groups[group].numUsers] = u;
    }
    
    function getUser(
        address user, 
        uint group
    ) private view returns (uint) {
        require(0 < group && group <= numGroups, "Invalid group index");
        uint index = 0;
        for (uint i = 0; i <= groups[group].numUsers; i++) {
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
    ) public view returns (int) {
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
        //require(user == groups[group].owner.userAddress, "You are not the owner of this group");
        require(interestRate > 0, "Interest rate needs to be higher than 0");
        groups[group].interestRate = interestRate;
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
        //require(user == groups[group].owner.userAddress, "You are not the owner of this group");
        require(monthlyPayment > 0, "Monthly payment needs to be higher than 0");
        groups[group].monthlyPayment = monthlyPayment;
    }
    
    function openApplication(
        uint group
    ) public {
        require(0 < group && group <= numGroups, "Invalid group index");
        groups[group].applicationOpen = true;
    }
    
    function closeApplication(
        uint group
    ) public {
        require(0 < group && group <= numGroups, "Invalid group index");
        groups[group].applicationOpen = false;
    }
    
    function joinWaitingList(
        uint group,
        address user
    ) public {
        require(groups[group].applicationOpen, "Application is not open");
        uint index = getUser(user, group);
        require(getUser(user, group) != 0, "User does not exist");
        require(getParticipant(user, group) == -1, "User has already joined the waiting list");
        User memory u = groups[group].users[index];
        require(u.hasBorrowed == false, "User has borrowed before");
        groups[group].participants.push(groups[group].users[index]);
    }
    
    function getApplicationWinner(
        uint group
    ) public returns (uint) {
        require(0 < group && group <= numGroups, "Invalid group index");
        require(!groups[group].applicationOpen, "Application is still open");
        uint numParticipants = groups[group].participants.length;
        uint index = random(numParticipants);
        
        //
        User memory u = groups[group].users[index];
        u.hasBorrowed = true;
        groups[group].borrower = u;
        
        //
        
        delete groups[group].participants;
        
        return index;
    }
    
    function random(uint x) public returns(uint) {
        uint randomnumber = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce))) % x;
        nonce++;
        return randomnumber;
    }
    
    /*
    function leaveGroup(
        uint group
    ) public {
        require(0 < group && group <= numGroups, "Invalid group index");
        delete groups[group].users[msg.sender];
    }
    */
    
    /**
     * @notice Only the manager can do
     */
    modifier restricted() {
        require(msg.sender == manager, "Can only be executed by the manager");
        _;
    }
}
