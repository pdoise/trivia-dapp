pragma solidity ^0.4.24;

import "./StateMachine.sol";

contract QuestionFactory is StateMachine {

    event QuestionCreated(string question);

    struct Question {
        string question;
        string answer;
        string incorrectOne;
        string incorrectTwo;
    }
    
    Question[] public questions;
    Question[] public unapprovedQuestions;
    Question public currentQuestion;

    mapping (uint => address) public questionToOwner;

    constructor() public {
        createQuestion("Sciophobia is the fear of what?", "Shadows", "Eating", "Transportation");
        createQuestion("Which is the youngest American city?", "Jacksonville, NC", "Paramount, CA", "Layton, UT");
        createQuestion("What is the currency of Brazil?", "The Bhat", "Real", "Krona");
        createQuestion("What is the Capital of Colorado", "Denver", "Colorado Springs", "Boulder");

        approveQuestion();
        approveQuestion();

        currentQuestion = questions[0];
    }

    function createQuestion(string _question, string _answer, string _incorrectOne, string _incorrectTwo) public {
        uint id = unapprovedQuestions.push(Question(_question, _answer, _incorrectOne, _incorrectTwo)) - 1;
 
        questionToOwner[id] = msg.sender;
        emit QuestionCreated(_question);
    }

    function approveQuestion() public verifyOwner() {
        require(unapprovedQuestions.length > 0);
        questions.push(unapprovedQuestions[0]);
        removeUnapprovedQuestion();
    }

    function removeUnapprovedQuestion() public verifyOwner() {
        require(unapprovedQuestions.length > 0);
        for (uint i = 0; i < unapprovedQuestions.length - 1; i++) {
          unapprovedQuestions[0] = unapprovedQuestions[0 + 1];
        }
        delete unapprovedQuestions[unapprovedQuestions.length - 1];
        unapprovedQuestions.length--;
    }

}