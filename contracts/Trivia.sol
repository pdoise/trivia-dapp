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

    constructor() public {
        owner = msg.sender;
        entryFee = 1;
        
        questions.push(Question("Sciophobia is the fear of what?", "Shadows", "Eating", "Transportation", false));
        questions.push(Question("Which is the youngest American city?", "Jacksonville, NC", "Paramount, CA", "Layton, UT", false));
    }

    // Admin function to set a different entry fee
    function setEntryFee(uint _entryFee) external verifyOwner() {
        entryFee = _entryFee;
    }

    function payEntryFee() public payable transitionToReveal(getPlayerCount()) atStage(Stages.AcceptingEntryFees) {
        require(!alreadyPlaying(msg.sender));
        require(msg.value >= entryFee);
        playerInfo[msg.sender].entryFee = msg.value;
        players.push(msg.sender);
    }

    function nextStage() internal {
        stage = Stages(uint(stage) + 1);
    }

    //function reveal() public atStage(Stages.RevealQuestion) {
    //    
    //}

    function alreadyPlaying(address player) public view returns(bool) {
        for (uint256 i = 0; i < players.length; i++) {
            if (players[i] == player) {
                return true;
            }
        }
        return false;
    }

    //function giveAnswer(bool isCorrect) public {
    //}

    function getPlayerWins() public view returns(uint) {
        return playerInfo[msg.sender].wins;
    }

    function getPlayerLosses() public view returns(uint) {
        return playerInfo[msg.sender].losses;
    }
  
    function getPlayerCount() public view returns(uint) {
        return players.length;
    }

}
