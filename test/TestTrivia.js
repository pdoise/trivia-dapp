const Trivia = artifacts.require('./Trivia.sol')

contract('Trivia', function(accounts) {

  var owner = accounts[0];
  var playerOne = accounts[1];
  var playerTwo = accounts[2];

  const entryFee = web3.toWei(1, "ether")

  function delay(t, v) {
    return new Promise(function(resolve) { 
       setTimeout(resolve.bind(null, v), t)
    });
  }

  it("should test stage Accepting Entry Fees", async() => {
    const trivia = await Trivia.deployed()
    const initPlayerCount = await trivia.getPlayerCount.call()
    const initPot = await trivia.pot.call()

    assert.equal(initPlayerCount.c[0], 0, "Expect player count to be 0 on init")
    assert.equal(initPot.c[0], 0, "Expect pot to be 0 on init")

    var eventEmitted = false
    var event = trivia.EntryFeePaid()
    await event.watch((err, res) => {
        eventEmitted = true
    })

    await trivia.payEntryFee({gas: 3000000, from: playerOne, value: entryFee})

    const newPlayerCount = await trivia.getPlayerCount.call()
    const newPot = await trivia.pot.call()

    assert.equal(newPlayerCount.c[0], 1, "Expect player count to increment by 1 after entry fee is paid")
    assert.equal(newPot.c[0], 10000, "Expect pot to increment by 1 eth after entry fee is paid")
    assert.equal(eventEmitted, true, "paying entry fee should emit an EntryFeePaid event")
  })

  it("should transition to question reveal", async() => {
    const trivia = await Trivia.deployed()

    const stage1 = await trivia.stage.call()
    assert.equal(stage1, 0, "stage should default to 0 (accepting fees)")

    return delay(30000).then( async() => {
      await trivia.payEntryFee({gas: 3000000, from: playerTwo, value: entryFee})
        
      const stage2 = await trivia.stage.call()
      assert.equal(stage2.c[0], 1, "should increment by 1 (reveal question)")
    });
  })

  it("should test stage Question Reveal", async() => {
    const trivia = await Trivia.deployed()
    const initAnswerCount = await trivia.answerCount.call()
    const initWinCount = await trivia.winCount.call()

    assert.equal(initAnswerCount.c[0], 0, "Expect answer count to be 0 on init")
    assert.equal(initWinCount.c[0], 0, "Expect win count to be 0 on init")

    var eventEmitted = false
    var event = trivia.AnswerSubmitted()
    await event.watch((err, res) => {
        eventEmitted = true
    })

    await trivia.giveAnswer("Shadows", {gas: 3000000, from: playerOne})
    const newAnswerCount = await trivia.answerCount.call()

    assert.equal(newAnswerCount.c[0], 1, "Expect answer count to increment by one when question is answered")
    assert.equal(eventEmitted, true, "answering question should emit an AnswerSubmitted event")
  })

  it("should transition to question complete", async() => {
    const trivia = await Trivia.deployed()
    const initWinCount = await trivia.winCount.call()
    assert.equal(initWinCount.c[0], 0, "Expect win count to be 0 on init")

    const stage2 = await trivia.stage.call()
    assert.equal(stage2, 1, "stage should default to 0 (reveal question)")

    return delay(20000).then( async() => {
      await trivia.giveAnswer("Eating", {gas: 3000000, from: playerTwo})
        
      const stage3 = await trivia.stage.call()
      const newWinCount = await trivia.winCount.call()

      assert.equal(stage3.c[0], 2, "should increment by 1 (complete)")
      assert.equal(newWinCount.c[0], 1, "Expect win count to be 0 to increment by one when question is answered correctly")
    });
  })

  it("should test stage Complete", async() => {
    const trivia = await Trivia.deployed()

    var eventEmitted = false
    var event = trivia.PlayerPaid()
    await event.watch((err, res) => {
        eventEmitted = true
    })

    await trivia.payPlayer({gas: 3000000, from: playerOne})

    assert.equal(eventEmitted, true, "accepting winnings should emit an PlayerPaid event")
  })

  it("should test end game player results", async() => {
    const trivia = await Trivia.deployed()
    var playerOneInfo = await trivia.playerInfo.call(playerOne);
    var playerTwoInfo = await trivia.playerInfo.call(playerTwo);

    assert.equal(playerOneInfo[1].c[0], 1, "player wins should increment")
    assert.equal(playerTwoInfo[1].c[0], 0, "player wins should not increment")
    assert.equal(playerOneInfo[2].c[0], 0, "player lossess should increment")
    assert.equal(playerTwoInfo[2].c[0], 1, "player lossess should not increment")
    assert.equal(playerOneInfo[3], true, "player answered correctly should be true")
    assert.equal(playerTwoInfo[3], false, "player answered correctly should be false")
    assert.equal(playerOneInfo[4], true, "player paid should be true")
    assert.equal(playerTwoInfo[4], false, "player paid should be false")
  })

});