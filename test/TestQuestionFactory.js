const QuestionFactory = artifacts.require('./QuestionFactory.sol')

contract('QuestionFactory', function(accounts) {

  var owner = accounts[0];
  var playerOne = accounts[1];

  it("should create question", async() => {
    const questionFactory = await QuestionFactory.deployed()

    initUnapprovedQuestionCount = await questionFactory.getUnapprovedQuestionsCount.call()

    var eventEmitted = false
    var event = questionFactory.QuestionCreated()
    await event.watch((err, res) => {
        eventEmitted = true
    })

    await questionFactory.createQuestion("foobar", "foo", "bar", "baz", { gas: 3000000, from: playerOne})
    unapprovedQuestionCount = await questionFactory.getUnapprovedQuestionsCount.call()
    
    assert.equal(unapprovedQuestionCount.c[0], initUnapprovedQuestionCount.c[0]+1, "creating question should increment unapproved questions array")
    assert.equal(eventEmitted, true, "creating question should emit an QuestionCreated event")
  })

  it("should approve question", async() => {
    const questionFactory = await QuestionFactory.deployed()

    initUnapprovedQuestionCount = await questionFactory.getUnapprovedQuestionsCount.call()
    initQuestionCount = await questionFactory.getQuestionsCount.call()

    await questionFactory.approveQuestion({gas: 3000000, from: owner})
    unapprovedQuestionCount = await questionFactory.getUnapprovedQuestionsCount.call()
    questionCount = await questionFactory.getQuestionsCount.call()
    
    assert.equal(unapprovedQuestionCount.c[0], initUnapprovedQuestionCount.c[0]-1, "approving a question should decrease unapproved questions array")
    assert.equal(questionCount.c[0], initQuestionCount.c[0]+1, "approving a question should increment the questions array")
  })

  it("should reject question", async() => {
    const questionFactory = await QuestionFactory.deployed()

    initUnapprovedQuestionCount = await questionFactory.getUnapprovedQuestionsCount.call()

    await questionFactory.removeUnapprovedQuestion({gas: 3000000, from: owner})
    unapprovedQuestionCount = await questionFactory.getUnapprovedQuestionsCount.call()
    
    assert.equal(unapprovedQuestionCount.c[0], initUnapprovedQuestionCount.c[0]-1, "rejecting a question should decrease unapproved questions array")
  })

  it("owner should be required to reject question", async() => {
    const questionFactory = await QuestionFactory.deployed()

    let err = null

    try {
      await questionFactory.removeUnapprovedQuestion({gas: 3000000, from: playerOne})
    } catch (error) {
      err = error
    }

    assert.ok(err instanceof Error)
  })

  it("owner should be required to approve question", async() => {
    const questionFactory = await QuestionFactory.deployed()

    let err = null

    try {
      await questionFactory.approveQuestion({gas: 3000000, from: playerOne})
    } catch (error) {
      err = error
    }

    assert.ok(err instanceof Error)
  })

});