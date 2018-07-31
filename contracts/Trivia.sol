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
        bool paid;
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
        require(!isQuestionOwner());
        require(owner != msg.sender);
        require(questions.length >= 1);
        require(msg.value >= entryFee);

        playerInfo[msg.sender].answer = "";
        playerInfo[msg.sender].answeredCorrectly = false;
        playerInfo[msg.sender].paid = false;

        pot += msg.value;
        players.push(msg.sender);
    }

    function giveAnswer(string _answer) external atStage(Stages.RevealQuestion) {
        require(alreadyPlaying(msg.sender));

        playerInfo[msg.sender].answer = _answer;
        answerCount++;
        if (answerCount >= getPlayerCount()) {
            determineWinners();
        }
    }

    function payPlayer() external payable atStage(Stages.Complete) {
        require(alreadyPlaying(msg.sender));
        require(playerInfo[msg.sender].answeredCorrectly);
        require(!playerInfo[msg.sender].paid);

        playerInfo[msg.sender].paid = true;
        msg.sender.transfer(earnings);
        paidCount++;

        if (paidCount >= winCount) {
            resetGame();
        }
    }

    function forceNextStage() external verifyOwner() {
        nextStage();
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

    function alreadyPlaying(address player) private view returns(bool) {
        for (uint i = 0; i < players.length; i++) {
            if (players[i] == player) {
                return true;
            }
        }
        return false;
    }

    function isQuestionOwner() private view returns(bool) {
        for (uint i = 0; i < questions.length; i++) {
            if (questionToOwner[i] == msg.sender) {
                return true;
            }
        }
        return false;
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

    function resetGame() private transitionToAcceptingFees() atStage(Stages.Complete) {
        delete players;
        delete paidCount;
        delete winCount;
        delete answerCount;
        delete pot;
        round++;
        currentQuestion = questions[round];
        creationTime = now;
    }

}
