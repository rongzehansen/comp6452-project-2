/// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IAccountManager {
    function getBalance(address userAddress) external returns (uint);
    function releaseFunds(address senderAddress, address targetAddress, uint amount) external;
    function leaveGroup(uint groupId, address userAddress) external;
}

interface IGroupManager {
    function createGroup(address user, string memory name) external returns (uint);
    function addUser(address user, uint group) external;
    //function removeUser(address user,uint group) external;
    function setPeriod(uint group, uint period) external;
    function getMonthlyPayment(uint group) external view returns (uint);
    function setMonthlyPayment(uint group, uint monthlyPayment) external;
    function setInterestRate(uint group, uint interestRate) external;
    function openApplication(uint group) external;
    function closeApplication(uint group) external;
    function joinWaitingList(uint group, address user) external;
    function makeLoanTransfer(uint group) external returns (address);
    function makeTermDeposit(address sender, uint group) external payable;
    function returnSavings(uint group) external returns (address[] memory users, uint[] memory savings);
    function reset(uint group) external;
}
