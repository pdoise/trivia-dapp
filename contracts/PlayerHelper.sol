pragma solidity ^0.4.24;

import "./QuestionFactory.sol";

/// @title Functions for players of Trivia
/// @author Phillip Doise
/// @dev Modifier and UI functions concerning Trivia players
contract PlayerHelper is QuestionFactory {

    address[] public players;
    mapping(address => Player) public playerInfo;

    struct Player {
        string answer;
        uint wins;
        uint losses;
        bool answeredCorrectly;
        bool paid;
    }

    /// @notice Get the count of current player wins
    /// @param _address Address of senders account
    /// @return Amount of times the player correctly answered a question
    function getPlayerWins(address _address) public view returns(uint) {
        return playerInfo[_address].wins;
    }

    /// @notice Get the count of current player losses
    /// @param _address Address of senders account
    /// @return Amount of times the player incorrectly answered a question
    function getPlayerLosses(address _address) public view returns(uint) {
        return playerInfo[_address].losses;
    }

    /// @notice Get the count of current players
    /// @return Number of current players
    function getPlayerCount() public view returns(uint) {
        return players.length;
    }

    /// @notice Did the player answer the question correctly?
    /// @param _address Address of senders account
    /// @return true if player answered the current question correctly
    function playerAnsweredCorrectly(address _address) public view returns(bool) {
        return playerInfo[_address].answeredCorrectly;
    }

    /// @notice Is player already in the game?
    /// @param _address Address of senders account
    /// @return true if player has already paid the entry fee
    function alreadyPlaying(address _address) internal view returns(bool) {
        for (uint i = 0; i < players.length; i++) {
            if (players[i] == _address) {
                return true;
            }
        }
        return false;
    }

    /// @notice Did player create the current question?
    /// @dev Player will already know the answer, stop him/her from playing this round
    /// @return true if player created the current question
    function isQuestionOwner() internal view returns(bool) {
        for (uint i = 0; i < questions.length; i++) {
            if (questionToOwner[i] == msg.sender) {
                return true;
            }
        }
        return false;
    }

}