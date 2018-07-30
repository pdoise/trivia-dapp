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
        questions.push(Question("Sciophobia is the fear of what?", "Shadows", "Eating", "Transportation"));
        questions.push(Question("Which is the youngest American city?", "Jacksonville, NC", "Paramount, CA", "Layton, UT"));
        createQuestion("What is the currency of Brazil?", "The Bhat", "Real", "Krona");
        createQuestion("What is the Capital of Colorado", "Denver", "Colorado Springs", "Boulder");

        currentQuestion = questions[0];
    }

    function createQuestion(string _question, string _answer, string _incorrectOne, string _incorrectTwo) public {
        uint question = unapprovedQuestions.push(Question(_question, _answer, _incorrectOne, _incorrectTwo));
 
        questionToOwner[question] = msg.sender;
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