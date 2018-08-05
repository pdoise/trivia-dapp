pragma solidity ^0.4.24;

import "./PlayerHelper.sol";

/// @title Perpetual Decentralized Trivia
/// @author Phillip Doise
/// @dev Inherits from all other contracts in the project
/// @dev Set gas to 30000000 to run contract in remix
contract Trivia is PlayerHelper {

    uint private round;
    uint public entryFee;
    uint public answerCount;
    Question public question;
    uint public pot;
    uint public earnings;
    uint public winCount;
    uint private paidCount;

    /// @notice Notify when entry fee is paid
    event EntryFeePaid(uint pot);

    /// @notice Notify when a user answers the question
    event AnswerSubmitted(string answer);

    /// @notice Notify when player recieves earnings
    event PlayerPaid(uint earnings);

    /// @notice Stop function in case of emercengy
    /// @dev Circuit breaker
    modifier stopInEmergency { require(!stopped); _; }

    /// @notice Set entry fee to 1 eth, start round counter
    constructor() public {
        entryFee = 1;
        round = 0;
    }

    /// @notice Admin function to set a different entry fee
    /// @dev Need to be able to change entry fee after contract creation
    function setEntryFee(uint _entryFee) external verifyOwner() {
        entryFee = _entryFee;
    }

    /// @notice Pay to play this round of trivia
    /// @dev Move to next stage with transitionToReveal if conditions are met, can only call function in AcceptingEntryFees stage
    function payEntryFee() external payable stopInEmergency 
        transitionToReveal(getPlayerCount()) atStage(Stages.AcceptingEntryFees) {
        /// @dev Validate that user has not already paid entry fee and is not the person who created the question 
        require(!alreadyPlaying(msg.sender));
        require(!isQuestionOwner());
        /// @dev Validate that user is not the contract owner, that there is a question to play and the tx value covers the entry fee 
        require(owner != msg.sender);
        require(questions.length >= 1);
        require(msg.value >= entryFee);
        /// @dev Reset relevent player info from previous round
        playerInfo[msg.sender].answer = "";
        playerInfo[msg.sender].answeredCorrectly = false;
        playerInfo[msg.sender].paid = false;

        /// @dev Add entry fee to pot and push player to playes array
        pot += msg.value;
        players.push(msg.sender);
        setQuestion();

        emit EntryFeePaid(pot);
    }

    /// @notice Give answer to current trivia question
    /// @dev Can only call function in RevealQuestion stage
    function giveAnswer(string _answer) external atStage(Stages.RevealQuestion) {
        /// @dev Protect against reentry attack
        require(alreadyPlaying(msg.sender));

        /// @dev Set player's answer and increment answerCount
        playerInfo[msg.sender].answer = _answer;
        answerCount++;

        /// @dev If all players answered its time to see who won
        if (answerCount >= getPlayerCount()) {
            determineWinners();
        }
        
        emit AnswerSubmitted(_answer);
    }

    /// @notice Pay out earnings for correct answers
    /// @dev Can only call function in Complete stage
    function payPlayer() external payable atStage(Stages.Complete) {
        /// @dev Make sure player is in the game, was not paid already and answered correctly
        require(alreadyPlaying(msg.sender));
        require(!playerInfo[msg.sender].paid);
        require(playerInfo[msg.sender].answeredCorrectly);
        /// @dev Set player info paid to true to protect against reentry attack
        playerInfo[msg.sender].paid = true;
        /// @dev transfer earnings to current player and increment paid count
        msg.sender.transfer(earnings);
        paidCount++;

        emit PlayerPaid(earnings);

        /// @dev If all players have accepted thier earnings round is over and reset
        if (paidCount >= winCount) {
            resetGame();
        }
    }

    /// @notice Admin function to force game to move forward
    /// @dev In some scenerios the state machine might get stuck due to lack of tx fee
    /// @dev This should be remedied in the future, maybe an external app that can ensure tx fees are paid at the correct times
    /// @dev Examples are if no users joins after 20 seconds, a player never answers the question or does not collect earnings
    /// @dev If this happens the contract owner has the power to increment the next stage to keep the game going
    function forceNextStage() external verifyOwner() {
        if (stage != Stages.Complete) {
            nextStage();
        } else {
            resetGame();
        }
    }

    /// @notice Set next Trivia question
    /// @dev Set internal variable to a public one when time comes to reveal the question
    function setQuestion() private atStage(Stages.AcceptingEntryFees) {
        question = currentQuestion;
    }

    /// @notice Determine winners and split pot
    /// @dev Move to next stage with transitionToComplete if conditions are met, can only call function in RevealQuestion stage
    function determineWinners() private transitionToComplete() atStage(Stages.RevealQuestion) {
        /// @dev Iterate through players and check to see if thier answer matches the correct answer, update player info acordingly
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
        
        /// @dev Give contract owner pot if noone answered correctly :) Otherwise calculate each winners earnings
        if (winCount == 0) {
            owner.transfer(pot);
        } else {
            earnings = pot / winCount;
        }
    }

    /// @notice End Current round and start the next one
    /// @dev Move to next stage with transitionToAcceptingFees if conditions are met, can only call function in Complete stage
    /// @dev Reset all game vairable and start from stage one, increment to next round
    function resetGame() private transitionToAcceptingFees() atStage(Stages.Complete) {
        delete players;
        delete paidCount;
        delete winCount;
        delete answerCount;
        delete pot;
        round++;
        if (questions.length >= round) {
          currentQuestion = questions[round];
        }
        creationTime = now;
    }

}
