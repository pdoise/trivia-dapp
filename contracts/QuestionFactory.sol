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
        questions.push(Question("Sciophobia is the fear of what?", "Shadows", "Eating", "Transportation", true));
        questions.push(Question("Which is the youngest American city?", "Jacksonville, NC", "Paramount, CA", "Layton, UT", true));
        questions.push(Question("What is the currency of Brazil?", "The Bhat", "Real", "Krona", false));
        questions.push(Question("What is the Capital of Colorado", "Denver", "Colorado Springs", "Boulder", false));

        currentQuestion = questions[0];
    }

    function createQuestion(string _question, string _answer, string _incorrectOne, string _incorrectTwo) public {
        uint question = questions.push(Question(_question, _answer, _incorrectOne, _incorrectTwo, false));
 
        questionToOwner[question] = msg.sender;
        emit QuestionCreated(_question);
    }

    function getUnapprovedQuestion() public view verifyOwner() returns(string, string, string, string) {
        Question memory result;
        uint counter = 0;
        for (uint i = 0; i < questions.length; i++) {
            if (questions[i].approved == false) {
                result = questions[i];
                break;
            }
            counter++;
        }
        return (result.question, result.answer, result.incorrectOne, result.incorrectTwo);
    }

    function acceptUnapprovedQuestion() public verifyOwner() {
        uint counter = 0;
        for (uint i = 0; i < questions.length; i++) {
            if (questions[i].approved == false) {
                questions[i].approved = true;
                return;
            }
            counter++;
        }
    }

    function rejectUnapprovedQuestion() public verifyOwner() {
        uint currentIndex;
        uint counter = 0;

        for (uint i = 0; i < questions.length; i++) {
            if (questions[i].approved == false) {
                currentIndex = i;
                break;
            }
            counter++;
        }

        if (currentIndex >= questions.length) return;

        for (uint j = 0; j<questions.length-1; j++){
            questions[j] = questions[j+1];
        }

        delete questions[questions.length-1];
        questions.length--;

    }

}