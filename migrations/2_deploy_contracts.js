var QuestionFactory = artifacts.require("./QuestionFactory.sol");
var Trivia = artifacts.require("./Trivia.sol");

module.exports = function(deployer) {
  deployer.deploy(QuestionFactory);
  deployer.deploy(Trivia);
};
