pragma solidity ^0.4.24;

import "./PlayerHelper.sol";

// note set gas to 30000000 in remix to run contract
contract Trivia is PlayerHelper {

    uint private round;
    uint public entryFee;
    uint private answerCount;
    Question public question;
    uint private pot;
    uint public earnings;
    uint public winCount;
    uint private paidCount;

    event EntryFeePaid(uint pot);
    event AnswerSubmitted(string answer);
    event PlayerPaid(uint earnings);

    constructor() public {
        entryFee = 1;
        round = 0;
        question = currentQuestion;
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
        setQuestion();

        emit EntryFeePaid(pot);
    }

    function giveAnswer(string _answer) external atStage(Stages.RevealQuestion) {
        require(alreadyPlaying(msg.sender));

        playerInfo[msg.sender].answer = _answer;
        answerCount++;
        if (answerCount >= getPlayerCount()) {
            determineWinners();
        }
        
        emit AnswerSubmitted(_answer);
    }

    function payPlayer() external payable atStage(Stages.Complete) {
        require(alreadyPlaying(msg.sender));
        require(playerInfo[msg.sender].answeredCorrectly);
        require(!playerInfo[msg.sender].paid);

        playerInfo[msg.sender].paid = true;
        msg.sender.transfer(earnings);
        paidCount++;

        emit PlayerPaid(earnings);

        if (paidCount >= winCount) {
            resetGame();
        }
    }

    function forceNextStage() external verifyOwner() {
        if (stage != Stages.Complete) {
            nextStage();
        } else {
            resetGame();
        }
    }

    function setQuestion() private atStage(Stages.AcceptingEntryFees) {
        question = currentQuestion;
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
        
        if (winCount == 0) {
            owner.transfer(pot);
        } else {
            earnings = pot / winCount;
        }
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
