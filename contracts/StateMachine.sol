pragma solidity ^0.4.18;

contract StateMachine {

    enum Stages {
        AcceptingEntryFees,
        RevealQuestion,
        Complete
    }

    Stages public stage;
    uint public creationTime;

    modifier atStage(Stages _stage) {
        require(
            stage == _stage); 
            _;
    }

    modifier transitionToReveal(uint _playerCount) {
        _;
        if (stage == Stages.AcceptingEntryFees && now >= creationTime + 10 seconds && _playerCount > 1) {
            stage = Stages.RevealQuestion;
        }
    }

    modifier transitionAfter() {
        _;
        nextStage();
    }

    constructor() public {
        creationTime = now;
        stage = Stages.AcceptingEntryFees;
    }

    function nextStage() internal {
        stage = Stages(uint(stage) + 1);
    }
}
