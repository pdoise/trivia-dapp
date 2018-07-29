pragma solidity ^0.4.24;

contract StateMachine {

    enum Stages {
        AcceptingEntryFees,
        RevealQuestion,
        Complete
    }
    
    address public owner;
    Stages public stage;
    uint public creationTime;

    modifier verifyOwner() {require(owner == msg.sender); _;}

    modifier atStage(Stages _stage) {
        require(stage == _stage); _;
    }

    modifier transitionToReveal(uint _playerCount) {
        _;
        if (stage == Stages.AcceptingEntryFees && now >= creationTime + 20 seconds && _playerCount > 0) {
            nextStage();
        }
    }

    modifier transitionToComplete() {
        _;
        if (stage == Stages.RevealQuestion && now >= creationTime + 50 seconds) {
            nextStage();
        }
    }

    constructor() public {
        owner = msg.sender;
        creationTime = now;
        stage = Stages.AcceptingEntryFees;
    }

    function nextStage() internal {
        stage = Stages(uint(stage) + 1);
    }
}
