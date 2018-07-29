pragma solidity ^0.4.24;

import "./QuestionFactory.sol";

contract Trivia is QuestionFactory {

    address[] public players;
    uint private round;
    uint public entryFee;
    uint private answerCount;
    uint private pot;
    uint public earnings;
    uint public winCount;
    uint private paidCount;

    mapping(address => Player) public playerInfo;

    struct Player {
        string answer;
        uint wins;
        uint losses;
        bool answeredCorrectly;
    }

    constructor() public {
        entryFee = 1;
        round = 0;
    }

    // Admin function to set a different entry fee
    function setEntryFee(uint _entryFee) external verifyOwner() {
        entryFee = _entryFee;
    }

    function payEntryFee() external payable transitionToReveal(getPlayerCount()) atStage(Stages.AcceptingEntryFees) {
        require(!alreadyPlaying(msg.sender));
        require(msg.value >= entryFee);
        playerInfo[msg.sender].answer = '';
        playerInfo[msg.sender].answeredCorrectly = false;
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

    function giveAnswer(string _answer) external atStage(Stages.RevealQuestion) {
        playerInfo[msg.sender].answer = _answer;
        answerCount++;
        if (answerCount >= getPlayerCount()) {
            determineWinners();
        }
    }

    function determineWinners() private transitionToComplete() atStage(Stages.RevealQuestion) {
        winCount = 0;
        
        for (uint i = 0; i < getPlayerCount(); i++) {
            address player = players[i];
            if (keccak256(playerInfo[player].answer) == keccak256(currentQuestion.answer)) {
                playerInfo[player].answeredCorrectly = true;
                playerInfo[player].wins++;
                winCount++;
            } else {
                playerInfo[player].losses++;
            }
        }

        earnings = pot / winCount;
    }

    function payPlayer() external payable atStage(Stages.Complete) {
        if (playerInfo[msg.sender].answeredCorrectly){
          msg.sender.transfer(earnings);
          paidCount++;
        }

        if (paidCount >= winCount ) {
            resetGame();
        }
    }

    function resetGame() private atStage(Stages.Complete) {
        delete players;
        delete paidCount;
        delete winCount;
        delete answerCount;
        delete pot;
        round++;
        currentQuestion = questions[round];
        stage = Stages.AcceptingEntryFees;
        creationTime = now;
    }

    function forceGameStart() external transitionToReveal(getPlayerCount()) atStage(Stages.AcceptingEntryFees) {
        require(alreadyPlaying(msg.sender));
    }

    function playerAnsweredCorrectly(address _address) public view returns(bool) {
        return playerInfo[_address].answeredCorrectly;
    }

    function getPlayerWins(address _address) public view returns(uint) {
        return playerInfo[_address].wins;
    }

    function getPlayerLosses(address _address) public view returns(uint) {
        return playerInfo[_address].losses;
    }

    function getPlayerCount() public view returns(uint) {
        return players.length;
    }

}
