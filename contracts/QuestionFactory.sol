pragma solidity ^0.4.24;

import "./StateMachine.sol";

contract QuestionFactory is StateMachine {

    event QuestionCreated(string question);

    struct Question {
        string question;
        string answer;
        string incorrectOne;
        string incorrectTwo;
        bool approved;
    }
    
    Question[] public questions;
    Question public currentQuestion;

    mapping (uint => address) public questionToOwner;

    constructor() public { 
        questions.push(Question("Sciophobia is the fear of what?", "Shadows", "Eating", "Transportation", false));
        questions.push(Question("Which is the youngest American city?", "Jacksonville, NC", "Paramount, CA", "Layton, UT", false));

        currentQuestion = questions[0];
    }

    function createQuestion(string _question, string _answer, string _incorrectOne, string _incorrectTwo) public {
        uint question = questions.push(Question(_question, _answer, _incorrectOne, _incorrectTwo, false));
 
        questionToOwner[question] = msg.sender;
        emit QuestionCreated(_question);
    }

}
