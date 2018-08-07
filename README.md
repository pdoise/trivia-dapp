# Perpetual Decentralized Trivia
## Tool Chain 
[node v8.11.1/npm 5.6.0/Truffle v4.1.13/ganache-cli v6.1.6]

## Getting started
1. git clone https://github.com/pdoise/trivia-dapp.git
1. Install metamask and serve on port: 8545
1. ```npm install -g truffle```
1. ```npm install -g ganache-cli```
1. ```ganache-cli```
1. Open new tab in terminal then:
1. ```cd trivia-dapp```
1. ```npm install```
1. ```truffle compile```
1. ```truffle migrate```
1. ```npm run start```
// Serves the front-end on http://localhost:3000

## Running unit tests
  1. Run `truffle test` to execute the unit tests
  
## Description
The intention is a trivia game that asks one question every ~60 seconds. Players pay a predetermined entry fee to play the game and then persons that answer the question correctly share the overall pot whilst people that answered incorrectly lose their fee. There are three stages:
1. Accepting bids: This stage allows up to ~20 seconds to allow time for players to join.
2. Question reveal: This stage reveals the question and allows players ~10 seconds to answer the question.
3. Complete: This stage tallies up winners and losers and distributes the pot accordingly.

Rinse and repeat

## User stories
Contract owner and Players.

Contract owner: The contract owner is responsible for creating questions, approving user submitted questions and enforcing time constraints if the app fails to do so. 
The pot is split by all players who answered correctly. If no player answers correctly the pot goes to the owner.
The owner also determines the entry fee which players will have to pay to play for the next question.
The owner is incentivized by making the questions fun (not too easy, not to difficult) and approving questions of the same nature to increase the user base.
The owner is not allowed to play as the owner has knowledge of all the correct answers.

Player: A player can join the game in the first stage by paying the entry fee. In the next stage they will answer a trivia question.
If answered correctly they will share the pot with other players who also answered correctly. A player may also create questions.
If the owner approves a user's question it will be used in the game. The player is incentivized to answer questions correctly and earn winnings.
A player cannot participate in game where the player is the one who created the question (player will already know the answer).

## ToDo
1. Incentivize a player to create an interesting question by offering a reward if it is accepted.
2. Use a third party to pay tx fees to enforce time constraints on the state machine (avoids owner being in charge of stage changes when the app fails to do so).
3. Owner should get a small fee of players entry fees.
4. Set up an admin type user to allow owner to delegate responsibilities.

## Troubleshooting and UI Testing
'truffle migrate --reset' will set the game back to its original state.

To test I open up metamask and create new accounts to serve as players. Account 1 cannot play, so I use account two and join game, switch to account 3 and join game ect.. until the game starts. After, I cycle the accounts and answer the questions for each account that is playing. Then collect earnings from winners on the last stage for each account that answered correctly. You can always force the next stage if you switch to Account 1 and go to the admin tab if it gets hung up for whatever reason.

The game will stop if it does not have at least two approved questions ready to go. Remedy this by approving questions as Account 1 and creating new questions as any account.

The UI does not display validation errors from the smart contract. If meta mask fails check the contract and make sure your not failing on conditionals or modifiers.

I sometimes run into issues where a tx wont go through or the app doesn't update. Switching metamask from the  private network to a test network and then back again, then running 'truffle migrate --reset' usually gets things back to normal for me.
