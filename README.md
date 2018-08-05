# Perpetual Decentralized Trivia
## Tool Chain 
[node v7.9.0/npm 4.2.0/Truffle v4.1.13/ganache-cli v6.1.6]

## Getting started
1. git clone https://github.com/pdoise/trivia-dapp.git
1. Install metamask and serve on port: 8545
1. ```npm install -g truffle```
1. ```npm install -g ganache-cli```
1. ```ganache-cli```
1. Open new tab in terminal then:
1. ```cd trivia-dapp```
1. ```truffle compile```
1. ```truffle migrate```
1. ```npm run start```
// Serves the front-end on http://localhost:3000

## Running unit tests
  1. Run `truffle test` to execute the unit tests
  
## Description
The intention is a trivia game that asks one question every ~60 seconds. Players pay a predetermined entree fee to play the game and then persons that answer the question correctly share the overall pot whilst people that answered incorrectly lose thier fee. There are three stages:
1. Accepting bids: This stage allows up to ~20 seconds to allow time for players to join.
2. Question reveal: This stage reveals the question and allows players ~10 seconds to answer the question.
3. Complete: This stage tallies up winners and losers and distributes the pot accordingly.

Rinse and repeat

## User stories
Contract owner and Players.

Contract owner: The contract owner is responsible for creating questions, approving user submited questions and enforcing time constraints if the app fails to do so. 
The pot is split by all players who answered correctly. If no player answer correctly the pot goes to the owner.
The owner also determines the entry fee which players will have to pay to play for the next question.
The owner is incentivized by making the questions fun (not too easy not to difficult) and approving questions of the same nature.
The owner is not allowed to play as the owner has knowledge of all the correct answers.

Player: A player can join the game in the first stage by paying the entry fee. In the next stage they will answer a trivia question.
If answered correctly they will share the pot with other players who also answered correctly. A player may also create a custom question.
If the owner approves the question it will be used in the game. The player is incentivized to answer questions correctly and earn winnings.
A player cannot participate in game where the player is the one who created the question (player will already know the answer).

## ToDo
1. Incentivize a player to create an interesting question by offering a reward if it is accepted.
2. Use a third party to pay tx fees to enforce time constraints on the state machine (avoids owner being in charge of stage changes).
3. Owner should get a small fee of players entry fees.
