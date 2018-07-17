var Trivia = artifacts.require("./Trivia.sol");

contract('Trivia', function(accounts) {

  it("...should store the value 89.", function() {
    return Trivia.deployed().then(function(instance) {
      triviaInstance = instance;

      return triviaInstance.set(89, {from: accounts[0]});
    }).then(function() {
      return triviaInstance.get.call();
    }).then(function(storedData) {
      assert.equal(storedData, 89, "The value 89 was not stored.");
    });
  });

});
