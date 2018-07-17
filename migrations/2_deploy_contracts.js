var Trivia = artifacts.require("./Trivia.sol");

module.exports = function(deployer) {
  deployer.deploy(Trivia);
};
