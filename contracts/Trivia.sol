pragma solidity ^0.4.18;

contract Trivia {
  address public owner;
  uint public entryFee;
  uint256 public totalFees;
  address[] public players;

  mapping(address => Player) public playerInfo;

  struct Player {
   uint256 fee;
   uint256 answer;
  }

  modifier verifyOwner() {require(owner == msg.sender); _;}

  function Trivia() public {
    owner = msg.sender;
    entryFee = 1;
  }

  // Admin function to set a different entry fee
  function setEntryFee(uint _entryFee) external verifyOwner() {
    entryFee = _entryFee;
  }

  function getPlayerCount() public constant returns(uint) {
    return players.length;
  }

}
