/// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract GroupManager {
    
    struct Group {
        uint index;
        string name;
        address[] users;
        bool voteOpen;
    }

    address public manager;
    uint public numGroups = 0;

    address public accountManager;
    mapping(uint => Group) public groups;

    uint public interestRates = 5;

    uint public securityDeposit = 0;
    mapping(uint => uint256) public groupBalances;
    
    /**
     * @dev Set manager when contract starts
     */
    constructor() {
        manager = msg.sender; // Set contract creator as manager
    }

    function setAccountManager(
        address externalManager
    ) public restricted {
        accountManager = externalManager;
    }

    function addGroup(
        string memory name
    ) public restricted returns (uint) {
        numGroups++;
        Group memory g;
        g.index = numGroups;
        g.name = name;
        g.voteOpen = false;
        groups[numGroups] = g;
        return numGroups;
    }

    function addUser(
        address user, 
        uint group
    ) public restricted {
        require(0 < group && group <= numGroups, "Invalid group index");
        require(getUser(user, group) == -1, "User already exists");
        groups[group].users.push(user);
    }

    function removeUser(
        address user, 
        uint group
    ) public restricted {
        require(0 < group && group <= numGroups, "Invalid group index");
        int index = getUser(user, group);
        require(0 <= index && index < int(groups[group].users.length), "Invalid user index");
        groups[group].users[uint(index)] = groups[group].users[groups[group].users.length - 1];
        groups[group].users.pop();
    }

    function getUser(
        address user, 
        uint group
    ) private view returns (int) {
        require(0 < group && group <= numGroups, "Invalid group index");
        int index = -1;
        for (uint i = 0; i < groups[group].users.length; i++) {
            if (groups[group].users[i] == user) {
                index = int(i);
                break;
            }
        }
        return index;
    }
    
    function deposit(address sender, uint group) external payable {
        require(0 < group && group <= numGroups, "Invalid group index");
        require(getUser(sender, group) != -1, "User does not belong to this group");
        uint256 interest = msg.value * interestRates / 100;
        securityDeposit += interest;
        groupBalances[group] += msg.value - interest;
    }

    /**
     * @notice Only the manager can do
     */
    modifier restricted() {
        require(msg.sender == manager, "Can only be executed by the manager");
        _;
    }
}

interface IGroupManager {
    function deposit(address sender, uint group) external payable;
}
