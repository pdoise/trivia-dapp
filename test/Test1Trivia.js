const Trivia = artifacts.require('./Trivia.sol')

contract('Trivia', function(accounts) {

  var owner = accounts[0];
  var playerOne = accounts[1];
  var playerTwo = accounts[2];

  const entryFee = web3.toWei(1, "ether")

  //Test that setEntryFee can only be updated by owner and correctly updates
  it("should test entry fee", async() => {
    const trivia = await Trivia.deployed()

    let err = null
    try {
        await trivia.setEntryFee(2, {from: playerOne})
    } catch (error) {
      err = error
    }

    var errEntryFee = await trivia.entryFee.call()
    assert.equal(errEntryFee.c[0], 1, "Expect entry fee to be 0")
    assert.ok(err instanceof Error)

    await trivia.setEntryFee(2, {from: owner})
    var entryFee = await trivia.entryFee.call()
    assert.equal(entryFee.c[0], 2, "Expect entry fee to be 2")
  })

  //Test that error is thrown if owner trys to play
  it("should not be able to play as contract owner", async() => {
    const trivia = await Trivia.deployed()

    let err = null
    try {
        await trivia.payEntryFee({from: owner, value: entryFee})
    } catch (error) {
      err = error
    }

    var playerCount = await trivia.getPlayerCount.call()
    assert.equal(playerCount.c[0], 0, "Expect player count to be 0 on init")
    assert.ok(err instanceof Error)
  })
  
  //Test variables and event regarding the payEntryFee method
  it("should test paying entry Fees", async() => {
    const trivia = await Trivia.deployed()

    //get and test init pot value to test for false positives
    const initPot = await trivia.pot.call()
    assert.equal(initPot.c[0], 0, "Expect pot to be 0 on init")

    //Set up watcher for EntryFeePaid event
    var eventEmitted = false
    var event = trivia.EntryFeePaid()
    await event.watch((err, res) => {
        eventEmitted = true
    })

    //Pay entry fee for player one
    await trivia.payEntryFee({from: playerOne, value: entryFee})

    //Assure that pot incremented and event fired
    const newPot = await trivia.pot.call()

    assert.equal(newPot.c[0], 10000, "Expect pot to increment by 1 eth after entry fee is paid")
    assert.equal(eventEmitted, true, "paying entry fee should emit an EntryFeePaid event")

    //Force next stage to bypass time requirements of state machine
    await trivia.payEntryFee({from: playerTwo, value: entryFee})
    await trivia.forceNextStage({from: owner})
  })

  //Test variables and event regarding the giveAnswer method
  it("should test answering questions", async() => {
    const trivia = await Trivia.deployed()

    //get and test init values to test for false positives
    const initAnswerCount = await trivia.answerCount.call()
    const initWinCount = await trivia.winCount.call()

    assert.equal(initAnswerCount.c[0], 0, "Expect answer count to be 0 on init")
    assert.equal(initWinCount.c[0], 0, "Expect win count to be 0 on init")

    //Set up watcher for AnswerSubmitted event
    var eventEmitted = false
    var event = trivia.AnswerSubmitted()
    await event.watch((err, res) => {
        eventEmitted = true
    })

    //Give correct answer for player one
    //Note: Answer is derived from the question factory for ease of use (not for use in production)
    await trivia.giveAnswer("Shadows", {from: playerOne})

    //Assure that answerCount and winCount incremented and event fired
    const newAnswerCount = await trivia.answerCount.call()

    assert.equal(newAnswerCount.c[0], 1, "Expect answer count to increment by one when question is answered")
    assert.equal(eventEmitted, true, "answering question should emit an AnswerSubmitted event")
  })

  // Test post game win counts
  it("should test win counts", async() => {
    const trivia = await Trivia.deployed()

     //get and test init values to test for false positives
    const initWinCount = await trivia.winCount.call()
    assert.equal(initWinCount.c[0], 0, "Expect win count to be 0 on init")

    //Force next stage to bypass time requirements of state machine
    await trivia.giveAnswer("Eating", {from: playerTwo})
    await trivia.forceNextStage({from: owner})
    //Test win counts
    const newWinCount = await trivia.winCount.call()
    assert.equal(newWinCount.c[0], 1, "Expect win count to be 0 to increment by one when question is answered correctly")
  })

  //Test variables and event regarding the payPlayer method
  it("should test paying player", async() => {
    const trivia = await Trivia.deployed()

    //Set up watcher for AnswerSubmitted event
    var eventEmitted = false
    var event = trivia.PlayerPaid()
    await event.watch((err, res) => {
        eventEmitted = true
    })
    
    // Pay player one who answered correctly and make sure event fired
    await trivia.payPlayer({from: playerOne})

    assert.equal(eventEmitted, true, "accepting winnings should emit an PlayerPaid event")
  })

});