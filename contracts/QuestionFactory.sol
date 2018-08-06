pragma solidity ^0.4.24;

import "./StateMachine.sol";

/// @title Create and approve trivia questions
/// @author Phillip Doise
/// @dev Question CRUD
contract QuestionFactory is StateMachine {

    Question[] internal questions;
    Question[] public unapprovedQuestions;
    Question internal currentQuestion;

    struct Question {
        string question;
        string answer;
        string incorrectOne;
        string incorrectTwo;
    }

    mapping (uint => address) public questionToOwner;

    /// @notice Notify when a new question is created
    event QuestionCreated(string question);

    /// @notice Set the question for the next round of trivia
    /// @dev For testing purposes and ease of use create some mock questions on startup (will need to remove before production)
    constructor() public {
        createQuestion("Sciophobia is the fear of what?", "Shadows", "Eating", "Transportation");
        createQuestion("Which is the youngest American city?", "Jacksonville, NC", "Paramount, CA", "Layton, UT");
        createQuestion("What is the currency of Brazil?", "The Bhat", "Real", "Krona");
        createQuestion("What is the Capital of Colorado", "Denver", "Colorado Springs", "Boulder");
        createQuestion("Which of the following countries is landlocked?", "Switzerland", "France", "Italy");

        approveQuestion();
        approveQuestion();
        approveQuestion();

        currentQuestion = questions[0];
    }

    /// @notice Create a new question
    /// @dev Recieve FE input, create question struct and push it to the unapproved question array so the contract owner can later review
    /// @dev Map question to current user so we can stop users from playing thier own question
    /// @param _question A trivia question
    /// @param _answer The correct answer
    /// @param _incorrectOne First incorrect answer
    /// @param _incorrectTwo Second incorrect answer
    function createQuestion(string _question, string _answer, string _incorrectOne, string _incorrectTwo) public {
        uint id = unapprovedQuestions.push(Question(_question, _answer, _incorrectOne, _incorrectTwo)) - 1;
 
        questionToOwner[id] = msg.sender;
        emit QuestionCreated(_question);
    }

    /// @notice Contract owner approves question for use
    /// @dev remove first item from unapprovedQuestions array and add it to the questions array
    function approveQuestion() public onlyOwner() {
        require(unapprovedQuestions.length > 0);
        questions.push(unapprovedQuestions[0]);
        removeUnapprovedQuestion();
    }

    /// @notice Reject unapproved questions
    /// @dev Remove first item from unapprovedQuestions array while retaining array ordering
    function removeUnapprovedQuestion() public onlyOwner() {
        require(unapprovedQuestions.length > 0);
        for (uint i = 0; i < unapprovedQuestions.length - 1; i++) {
          unapprovedQuestions[i] = unapprovedQuestions[i + 1];
        }
        delete unapprovedQuestions[unapprovedQuestions.length - 1];
        unapprovedQuestions.length--;
    }

    /// @notice Get the count of all questions
    /// @dev Getter for questions array
    /// @return question count
    function getQuestionsCount() public view returns(uint) {
        return questions.length;
    }

    /// @notice Get the count of all unapproved questions
    /// @dev Getter for unapprovedQuestions array
    /// @return unapproved question count
    function getUnapprovedQuestionsCount() public view returns(uint) {
        return unapprovedQuestions.length;
    }
}