pragma solidity ^0.4.18;


contract QuestionFactory {

    event QuestionCreated(string question);

    struct Question {
        string question;
        string answer;
        string incorrectOne;
        string incorrectTwo;
        bool approved;
    }

    Question[] public questions;

    mapping (uint => address) public questionToOwner;

    function createQuestion(string _question, string _answer, string _incorrectOne, string _incorrectTwo) public {
        uint question = questions.push(Question(_question, _answer, _incorrectOne, _incorrectTwo, false));
 
        questionToOwner[question] = msg.sender;
        emit QuestionCreated(_question);
    }

}
