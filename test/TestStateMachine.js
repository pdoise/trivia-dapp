const Trivia = artifacts.require('./Trivia.sol')


//This test will run through each stage and transition for one round of trivia
contract('StateMachine', function(accounts) {

  var playerOne = accounts[1];
  var playerTwo = accounts[2];

  const entryFee = web3.toWei(1, "ether")

  //Delay function to mimic time requirements in stages
  function delay(t, v) {
    return new Promise(function(resolve) { 
       setTimeout(resolve.bind(null, v), t)
    });
  }

  //Should not increment to next stage before 30 second time requirement
  it("should test stage Accepting Entry Fees", async() => {
    const trivia = await Trivia.deployed()

    //Pay entry fee for player one
    await trivia.payEntryFee({from: playerOne, value: entryFee})
    const stage = await trivia.stage.call()

    assert.equal(stage, 0, "stage should default to 0 (accepting fees)")
  })

  //Should increment to next stage if requirements are met
  it("should transition to question reveal", async() => {
    const trivia = await Trivia.deployed()

    //Make sure current stage is acceptingEntryFees
    const stage1 = await trivia.stage.call()
    assert.equal(stage1, 0, "stage should default to 0 (accepting fees)")
    
    //Wait 30 seconds to make sure we fufilled the time requirement of the state machine
    return delay(30000).then( async() => {
      // Add second player and test that stage transitioned to QuestionReveal
      await trivia.payEntryFee({from: playerTwo, value: entryFee})
        
      const stage2 = await trivia.stage.call()
      assert.equal(stage2.c[0], 1, "should increment by 1 (reveal question)")
    });
  })

  //Should not increment to next stage before 20 second time requirement
  it("should test stage Question Reveal", async() => {
    const trivia = await Trivia.deployed()

    await trivia.giveAnswer("Shadows", {from: playerOne})
    const stage = await trivia.stage.call()

    assert.equal(stage, 1, "stage should default to 0 (accepting fees)")
  })

  //Should increment to next stage if requirements are met
  it("should transition to question complete", async() => {
    const trivia = await Trivia.deployed()

    //Wait 20 seconds to make sure we fufilled the time requirement of the state machine
    return delay(20000).then( async() => {
      // Give incorrect answer for second player and test that stage transitioned to Complete.
      await trivia.giveAnswer("Eating", {from: playerTwo})
        
      const stage = await trivia.stage.call()

      assert.equal(stage.c[0], 2, "should increment by 1 (complete)")
    });
  })

  //Should increment to next stage after player is paid
  it("should test stage Complete", async() => {
    const trivia = await Trivia.deployed()
    
    // Pay player one who answered correctly
    await trivia.payPlayer({from: playerOne})

    const stage = await trivia.stage.call()

    assert.equal(stage.c[0], 0, "should reset back to first stage")
  })

});