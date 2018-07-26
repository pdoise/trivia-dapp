pragma solidity ^0.4.18;

import "./QuestionFactory.sol";

contract Trivia is QuestionFactory {

    enum Stages {
        AcceptingEntryFees,
        RevealQuestion,
        Complete
    }

    address public owner;
    uint public entryFee;
    address[] public players;
    Stages public stage;
    uint public creationTime;

    modifier atStage(Stages _stage) {
        require(
            stage == _stage); 
            _;
    }

    modifier transitionToReveal() {
        _;
        if (stage == Stages.AcceptingEntryFees && now >= creationTime + 10 seconds && players.length > 1) {
            stage = Stages.RevealQuestion;
        }
    }

    modifier transitionAfter() {
        _;
        nextStage();
    }

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
        creationTime = now;
        stage = Stages.AcceptingEntryFees;
        
        questions.push(Question("Sciophobia is the fear of what?", "Shadows", "Eating", "Transportation", false));
        questions.push(Question("Which is the youngest American city?", "Jacksonville, NC", "Paramount, CA", "Layton, UT", false));
    }

    // Admin function to set a different entry fee
    function setEntryFee(uint _entryFee) external verifyOwner() {
        entryFee = _entryFee;
    }

    function payEntryFee(uint _entryFee) public payable transitionToReveal atStage(Stages.AcceptingEntryFees) {
        require(!alreadyPlaying(msg.sender));
        require(msg.value >= entryFee);
        playerInfo[msg.sender].entryFee = msg.value;
        players.push(msg.sender);
    }

    function nextStage() internal {
        stage = Stages(uint(stage) + 1);
    }

    function reveal() public atStage(Stages.RevealQuestion) {
        
    }

    function alreadyPlaying(address player) public constant returns(bool) {
        for (uint256 i = 0; i < players.length; i++) {
            if (players[i] == player) {
                return true;
            }
        }
        return false;
    }

    function giveAnswer(bool isCorrect) public {
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
