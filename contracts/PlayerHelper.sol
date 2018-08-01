pragma solidity ^0.4.24;

import "./QuestionFactory.sol";


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

    function getPlayerWins(address _address) public view returns(uint) {
        return playerInfo[_address].wins;
    }

    function getPlayerLosses(address _address) public view returns(uint) {
        return playerInfo[_address].losses;
    }

    function getPlayerCount() public view returns(uint) {
        return players.length;
    }

    function playerAnsweredCorrectly(address _address) public view returns(bool) {
        return playerInfo[_address].answeredCorrectly;
    }

    function alreadyPlaying(address player) internal view returns(bool) {
        for (uint i = 0; i < players.length; i++) {
            if (players[i] == player) {
                return true;
            }
        }
        return false;
    }

    function isQuestionOwner() internal view returns(bool) {
        for (uint i = 0; i < questions.length; i++) {
            if (questionToOwner[i] == msg.sender) {
                return true;
            }
        }
        return false;
    }

}