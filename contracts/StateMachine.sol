pragma solidity ^0.4.24;
import "./oraclize/usingOraclize.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/// @title A solidity timed state machine
/// @author Phillip Doise
/// @dev To better understand this contract see: http://solidity.readthedocs.io/en/v0.4.24/common-patterns.html#state-machine
/// @dev Importing ethPm Oraclize with future intent to use it for updating stage by time conditions
contract StateMachine is usingOraclize, Ownable {

    uint private balance;
    Stages public stage;
    uint public creationTime;
    bool public stopped;

    enum Stages {
        AcceptingEntryFees,
        RevealQuestion,
        Complete
    }

    /// @notice Modifier to ensure method can only be called on the current stage
    modifier atStage(Stages _stage) {
        assert(stage == _stage); _;
    }

    /// @notice Transition to the RevealQuestion stage if there is at least one player and ~20 seconds has passed since the start of the round
    /// @param _playerCount The amount of users that have paid the entry fee
    modifier transitionToReveal(uint _playerCount) {
        _;
        if (stage == Stages.AcceptingEntryFees && now >= creationTime + 20 seconds && _playerCount > 0) {
            nextStage();
        }
    }

    /// @notice Transition to the Complete stage if ~30 seconds has passed since the start of the round
    modifier transitionToComplete() {
        _;
        if (stage == Stages.RevealQuestion && now >= creationTime + 30 seconds) {
            nextStage();
        }
    }
    
    /// @notice Transition to the AcceptingEntryFees if requirements are met from the calling method
    modifier transitionToAcceptingFees() {
        _;
        if (stage == Stages.Complete) {
            stage = Stages.AcceptingEntryFees;
        }
    }

    /// @notice Set owner of the contract, Set state machine creation time to now, set the first stage
    constructor() public {
        creationTime = now;
        stage = Stages.AcceptingEntryFees;
        stopped = false;
    }

    /// @dev Fallback Function
    function() public payable {
        balance += msg.value;
    }
    
    /// @dev Self Destruct Contract
    function kill() public onlyOwner() {
        selfdestruct(owner);
    }

    /// @notice Admin function to stop certain functions in an emergency
    /// @dev Circuit breaker that allows contract functionality to be stopped
    function circuitBreaker(bool _stopped) external onlyOwner() {
        stopped = _stopped;
    }

    /// @notice Move to stage of the game
    /// @dev cycle through the Stages enum
    function nextStage() internal {
        stage = Stages(uint(stage) + 1);
    }
}
