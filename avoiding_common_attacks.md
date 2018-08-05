# Perpetual Decentralized Trivia Avoiding Common Attacks

## Description
Please review the README.md for a description on how the game works and the different user stories to better understand the design patterns. This document explains how this app avoids common attacks.

## Reentrancy attacks
Players have access to two payable functions payEntryFee and payPlayer. 

Once a player has paid the entryfee they are added to the playerInfo mapping. If the user tries to pay pay again a function will revert the tx if it finds the player has already paid.

Once a player accept thier earnings there is a bool on the playInfo struct that flags that player as paid and will revert the tx if they try to claim earinings again

## Potential cross function race conditions
Players only have access to one function at each stage of the state machine design pattern ensuring no cross function race conditions

## Integer Overflow and Underflow
The only accepted input in this contract if submitting questions for review. The contact owner must  approve all questions before being used in the game.

## Transaction Ordering and Timestamp Dependence
This project has a minimal risk due to the timed state machine pattern. A miner could potentialy delay the next stage maybe to have more time to find the answer to the question. The contract owner currently  has a function to force the next stage if necessary. Outsourcing this job to a service such as Ethereum Time Machine will negate the need for timestamps altogether in future iterations of this project.

## Denial of Service
This project uses a withdrawal system to prevent this sort of attack

## Forcibly Sending Ether
Percautions have been taken to ensure the project does not use an invariant that strictly checks the balance of a contract.