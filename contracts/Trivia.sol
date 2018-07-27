pragma solidity ^0.4.24;

import "./QuestionFactory.sol";

contract Trivia is QuestionFactory {

    address public owner;
    uint public entryFee;
    uint public answerCount;
    uint public pot;
    address[] public players;
    uint public maxPlayerCount;

    mapping(address => Player) public playerInfo;

    struct Player {
        string answer;
        uint wins;
        uint losses;
    }

    modifier verifyOwner() {require(owner == msg.sender); _;}

    constructor() public {
        owner = msg.sender;
        entryFee = 1;
        maxPlayerCount = 100;
    }

    // Admin function to set a different entry fee
    function setEntryFee(uint _entryFee) external verifyOwner() {
        entryFee = _entryFee;
    }

    function payEntryFee() public payable transitionToReveal(getPlayerCount()) atStage(Stages.AcceptingEntryFees) {
        require(getPlayerCount() <= maxPlayerCount);
        require(!alreadyPlaying(msg.sender));
        require(msg.value >= entryFee);
        pot += msg.value;
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

    function determineWinners() public payable atStage(Stages.RevealQuestion) {
        address[] memory winners = new address[](maxPlayerCount);
        uint winCount = 0;

        for (uint i = 0; i < getPlayerCount(); i++) {
            address player = players[i];
            if (keccak256(playerInfo[player].answer) == keccak256(questions[0].answer)) {
                playerInfo[player].wins++;
                winners[winCount] = player;
                winCount++;
            } else {
                playerInfo[player].losses++;
            }
        }

        uint earnings = pot / winCount;
        for (uint j = 0; j < winners.length; j++) {
            if(winners[j] != address(0)){
              winners[j].transfer(earnings);
            }
        }
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
