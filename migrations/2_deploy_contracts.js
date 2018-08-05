var StateMachine = artifacts.require("./StateMachine.sol");
var QuestionFactory = artifacts.require("./QuestionFactory.sol");
var PlayerHelper = artifacts.require("./PlayerHelper.sol");
var Trivia = artifacts.require("./Trivia.sol");
var usingOraclize = artifacts.require("usingOraclize.sol");

module.exports = function(deployer) {
  deployer.deploy(StateMachine);
  deployer.deploy(QuestionFactory);
  deployer.deploy(PlayerHelper);
  deployer.deploy(Trivia);
  deployer.deploy(usingOraclize);
};
