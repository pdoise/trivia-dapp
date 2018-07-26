pragma solidity ^0.4.18;

import "./QuestionFactory.sol";

contract Trivia is QuestionFactory {
    address public owner;
    uint public entryFee;
    address[] public players;

    mapping(address => Player) public playerInfo;

    struct Player {
        uint256 entryFee;
        uint256 answer;
        uint256 wins;
        uint256 losses;
    }

    modifier verifyOwner() {require(owner == msg.sender); _;}

    function Trivia() public {
        owner = msg.sender;
        entryFee = 1;
        questions.push(Question("Sciophobia is the fear of what?", "Shadows", "Eating", "Transportation", false));
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

    function giveAnswer(bool isCorrect) public payable {
        require(!alreadyPlaying(msg.sender));
        require(msg.value >= entryFee);
        playerInfo[msg.sender].entryFee = msg.value;
        players.push(msg.sender);
    }

    function getPlayerWins() public constant returns(uint) {
        return playerInfo[msg.sender].wins;
    }

    function getPlayerLosses() public constant returns(uint) {
        return playerInfo[msg.sender].losses;
    }
  
    function getPlayerCount() public constant returns(uint) {
        return players.length;
    }

}
