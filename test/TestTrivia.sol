pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Trivia.sol";

contract TestTrivia{

  function testItStoresAValue() public {
    Trivia trivia = Trivia(DeployedAddresses.Trivia());

    trivia.set(89);

    uint expected = 89;

    Assert.equal(trivia.get(), expected, "It should store the value 89.");
  }

}
