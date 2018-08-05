# Perpetual Decentralized Trivia Design Pattern Decisions

## Description
Please review the README.md for a description on how the game works and the different user stories to better understand the design patterns


## State Machine
A state machine pattern is used to manage the 3 stages of the game. 

The first stage (acceptingEntryFees) requires at least one player and ~30 seconds to move on to the next stage. The atStage modifier ensures that the function payEntryFee can only be called in this stage. The last player to pay the entry fee after the time requirement expires triggers the next stage.

The second stage (questionReveal) requires ~20 to move to the next stage. The atStage modifier ensures that the function answerQuestion can only be called in this stage. The last player to answer the question after the time requirement expires triggers the next stage.

The second stage (Complete) requires players to accept thier winnings to move to the next stage. The atStage modifier ensures that the function payPlayer can only be called in this stage. The last player to claim thier reward triggers the next stage.

## Restricting Access
A modifier called verifyOwner is used to restrict access to particular functions.

Some examples are:
1. ForceNextStage - Only contract owner can force the state machine to transition to the next stage
2. approveQuestion - Only contract owner can approve user submitted questions
3. removeUnapprovedQuestion - Only contract owner can reject user submitted questions

## Fail early and fail loud
Require statements and modifiers are used where ever possible in lieu of if statements.

## Mortal 
Implemented the mortal design pattern which gives the ability to destroy the contract and remove it from the blockchain.

## Pull over Push Payments
Players must withdraw thier winnings on thier own by calling the payPlayer function to recieve funds as opposed to automatically transfering to accounts.

## Circuit Breaker
A circuit breaker was implemented to stop players from joining the game and paying entry fees in case of emergency. The contract owner can turn this on and off.



