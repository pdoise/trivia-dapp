pragma solidity ^0.4.18;

contract Trivia {
  address public owner;
  uint public entryFee;
  uint256 public totalFees;
  address[] public players;

  mapping(address => Player) public playerInfo;

  struct Player {
   uint256 entryFee;
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

  function alreadyPlaying(address player) public constant returns(bool) {
    for (uint256 i = 0; i < players.length; i++) {
      if (players[i] == player) {
        return true;
      }
    }
    return false;
  }

  function enroll() public payable {
    require(!alreadyPlaying(msg.sender));
    require(msg.value >= entryFee);
    playerInfo[msg.sender].entryFee = msg.value;
    players.push(msg.sender);
  }

  function getPlayerCount() public constant returns(uint) {
    return players.length;
  }

}
