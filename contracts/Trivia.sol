pragma solidity ^0.4.18;

import "./QuestionFactory.sol";

contract Trivia is QuestionFactory {

    address public owner;
    uint public entryFee;
    uint public answerCount;
    address[] public players;
    address[] public winners;

    mapping(address => Player) public playerInfo;

    struct Player {
        uint entryFee;
        string answer;
        uint wins;
        uint losses;
    }

    modifier verifyOwner() {require(owner == msg.sender); _;}

    constructor() public {
        owner = msg.sender;
        entryFee = 1;
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

    function alreadyPlaying(address player) public view returns(bool) {
        for (uint i = 0; i < players.length; i++) {
            if (players[i] == player) {
                return true;
            }
        }
        return false;
    }

    function giveAnswer(string _answer) public atStage(Stages.RevealQuestion) {
        playerInfo[msg.sender].answer = _answer;
        answerCount++;
        if (answerCount >= getPlayerCount()) {
            determineWinners();
        }
    }

    function determineWinners() public atStage(Stages.RevealQuestion) {      
        uint count = 0;
        for (uint i = 0; i < getPlayerCount(); i++) {
            address player = players[i];
            if (keccak256(playerInfo[player].answer) == keccak256(questions[0].answer)) {
                playerInfo[player].wins++;
                winners.push(player);
                count++;
            } else {
                playerInfo[player].losses++;
            }
        }
        payWinners();
    }

    function payWinners() public payable atStage(Stages.RevealQuestion) {
        uint earnings = setEarnings();

        uint count = 0;
        for (uint i = 0; i < winners.length; i++) {
            winners[i].transfer(earnings);
        }
    }

    function setEarnings() public atStage(Stages.RevealQuestion) returns(uint) {
        return answerCount / winners.length;
    }

    function forceGameStart() public transitionToReveal(getPlayerCount()) atStage(Stages.AcceptingEntryFees) {
        require(alreadyPlaying(msg.sender));
    }

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
