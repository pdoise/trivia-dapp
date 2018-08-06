const Trivia = artifacts.require('./Trivia.sol')

const entryFee = web3.toWei(1, "ether")

contract('PlayerHelper', function(accounts) {

  var owner = accounts[0];
  var playerOne = accounts[1];
  var playerTwo = accounts[2];

  //Test init values to test for false positives
  it("should test starting values for players", async() => {
    const trivia = await Trivia.deployed()

    var playerCount = await trivia.getPlayerCount.call()
    var playerOneInfo = await trivia.playerInfo.call(playerOne);
    var playerTwoInfo = await trivia.playerInfo.call(playerTwo);

    assert.equal(playerCount.c[0], 0, "Expect player count to be 0 on init")
    assert.equal(playerOneInfo[1].c[0], 0, "player wins init value should be 0")
    assert.equal(playerOneInfo[2].c[0], 0, "player lossess init value should be 0")
    assert.equal(playerOneInfo[3], false, "player answered correctly init value should be false")
    assert.equal(playerOneInfo[4], false, "player paid init value should be false")
    assert.equal(playerTwoInfo[1].c[0], 0, "player wins init value should be 0")
    assert.equal(playerTwoInfo[2].c[0], 0, "player lossess init value should be 0")
    assert.equal(playerTwoInfo[3], false, "player answered correctly init value should be false")
    assert.equal(playerTwoInfo[4], false, "player paid init value should be false")
  })

  //Test the function internal function alreadyPlaying to ensure one player cant enter the game more than
  it("should not allow player to pay entry fee twice", async() => {
    const trivia = await Trivia.deployed()

    await trivia.payEntryFee({from: playerOne, value: entryFee})
    var playerCount = await trivia.getPlayerCount.call()

    assert.equal(playerCount.c[0], 1, "Expect player count to be 1")

    let err = null
    try {
        await trivia.payEntryFee({from: playerOne, value: entryFee})
    } catch (error) {
      err = error
    }
    var playerCount = await trivia.getPlayerCount.call()

    assert.equal(playerCount.c[0], 1, "Expect player count to be 1")
    assert.ok(err instanceof Error)
  })

  //Test the playerAnsweredCorrectly function
  it("should test if player answered correctly", async() => {
    const trivia = await Trivia.deployed()
    
    //Force next stage to bypass time requirements of state machine
    await trivia.payEntryFee({from: playerTwo, value: entryFee})
    await trivia.forceNextStage({from: owner})
    
    //Player one answers correctly
    await trivia.giveAnswer("Shadows", {from: playerOne})
    //Player two answers incorrectly
    await trivia.giveAnswer("foobar", {from: playerTwo})

    var player1AnsweredCorrectly = await trivia.playerAnsweredCorrectly.call(playerOne)
    var player2AnsweredCorrectly = await trivia.playerAnsweredCorrectly.call(playerTwo)

    assert.equal(player1AnsweredCorrectly, true, "player one answered correctly")
    assert.equal(player2AnsweredCorrectly, false, "player tow answered incorrectly")
    //Force next stage to bypass time requirements of state machine
    await trivia.forceNextStage({from: owner})
  })

  //Test that player cannot claim earnings if player did not win
  it("should not claim winnnings if answered incorrectly", async() => {
    const trivia = await Trivia.deployed()

    let err = null
    try {
      await trivia.payPlayer({from: playerTwo})
    } catch (error) {
      err = error
    }

    assert.ok(err instanceof Error)
  })

  //Test that player cannot claim earnings more than once
  it("should only claim winnings once", async() => {
    const trivia = await Trivia.deployed()

    await trivia.payPlayer({from: playerOne})

    let err = null
    try {
      await trivia.payPlayer({from: playerOne})
    } catch (error) {
      err = error
    }

    assert.ok(err instanceof Error)
  })

  // Test that both players recieve the expected outcome for the round
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