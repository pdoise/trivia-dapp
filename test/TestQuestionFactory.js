const QuestionFactory = artifacts.require('./QuestionFactory.sol')

contract('QuestionFactory', function(accounts) {

  var owner = accounts[0];
  var playerOne = accounts[1];

  // Note: Questions are not actually used in the game untill they are approved by the contract owner
  // Get current length of unapprovedQuestions array to test false positve
  // Create question struct and make sure unapprovedQuestions has incremented, make sure event fired
  it("should create question", async() => {
    const questionFactory = await QuestionFactory.deployed()

    initUnapprovedQuestionCount = await questionFactory.getUnapprovedQuestionsCount.call()

    var eventEmitted = false
    var event = questionFactory.QuestionCreated()
    await event.watch((err, res) => {
        eventEmitted = true
    })

    await questionFactory.createQuestion("foobar", "foo", "bar", "baz", { from: playerOne})
    unapprovedQuestionCount = await questionFactory.getUnapprovedQuestionsCount.call()
    
    assert.equal(unapprovedQuestionCount.c[0], initUnapprovedQuestionCount.c[0]+1, "creating question should increment unapproved questions array")
    assert.equal(eventEmitted, true, "creating question should emit an QuestionCreated event")
  })

  // Note: Once the contract owner approves a question it gets pushed to the games questions array for use
  // Get current length of unapprovedQuestions array and questions array to test false positve
  // Approve question as owner and make sure unapprovedQuestions decremented and questions incremented
  it("should approve question", async() => {
    const questionFactory = await QuestionFactory.deployed()

    initUnapprovedQuestionCount = await questionFactory.getUnapprovedQuestionsCount.call()
    initQuestionCount = await questionFactory.getQuestionsCount.call()

    await questionFactory.approveQuestion({from: owner})
    unapprovedQuestionCount = await questionFactory.getUnapprovedQuestionsCount.call()
    questionCount = await questionFactory.getQuestionsCount.call()
    
    assert.equal(unapprovedQuestionCount.c[0], initUnapprovedQuestionCount.c[0]-1, "approving a question should decrease unapproved questions array")
    assert.equal(questionCount.c[0], initQuestionCount.c[0]+1, "approving a question should increment the questions array")
  })

  // Note: The removeUnapprovedQuestion method serves to remove question in the approveQuestion method(occured above) as well as reject question
  // Get current length of unapprovedQuestions array to test false positve
  // Reject question as owner and make sure unapprovedQuestions decremented
  it("should reject question", async() => {
    const questionFactory = await QuestionFactory.deployed()

    initUnapprovedQuestionCount = await questionFactory.getUnapprovedQuestionsCount.call()

    await questionFactory.removeUnapprovedQuestion({from: owner})
    unapprovedQuestionCount = await questionFactory.getUnapprovedQuestionsCount.call()
    
    assert.equal(unapprovedQuestionCount.c[0], initUnapprovedQuestionCount.c[0]-1, "rejecting a question should decrease unapproved questions array")
  })

  // Attempt to reject a question as a non admin and assert error
  it("owner should be required to reject question", async() => {
    const questionFactory = await QuestionFactory.deployed()

    let err = null

    try {
      await questionFactory.removeUnapprovedQuestion({from: playerOne})
    } catch (error) {
      err = error
    }

    assert.ok(err instanceof Error)
  })

   // Attempt to approve a question as a non admin and assert error
  it("owner should be required to approve question", async() => {
    const questionFactory = await QuestionFactory.deployed()

    let err = null

    try {
      await questionFactory.approveQuestion({from: playerOne})
    } catch (error) {
      err = error
    }

    assert.ok(err instanceof Error)
  })

});