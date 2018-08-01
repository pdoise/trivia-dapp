pragma solidity ^0.4.24;

contract StateMachine {

    address public owner;
    uint private balance;
    Stages public stage;
    uint public creationTime;

    enum Stages {
        AcceptingEntryFees,
        RevealQuestion,
        Complete
    }

    modifier verifyOwner() {require(owner == msg.sender); _;}

    modifier atStage(Stages _stage) {
        assert(stage == _stage); _;
    }

    modifier transitionToReveal(uint _playerCount) {
        _;
        if (stage == Stages.AcceptingEntryFees && now >= creationTime + 20 seconds && _playerCount > 0) {
            nextStage();
        }
    }
    
    modifier transitionToComplete() {
        _;
        if (stage == Stages.RevealQuestion && now >= creationTime + 30 seconds) {
            nextStage();
        }
    }
    
    modifier transitionToAcceptingFees() {
        _;
        if (stage == Stages.Complete) {
            stage = Stages.AcceptingEntryFees;
        }
    }

    constructor() public {
        owner = msg.sender;
        creationTime = now;
        stage = Stages.AcceptingEntryFees;
    }

    // Fallback Functions
    function() public payable {
        balance += msg.value;
    }
    
    function kill() verifyOwner() {
        selfdestruct(owner);
    }

    function nextStage() internal {
        stage = Stages(uint(stage) + 1);
    }
}
