import React, { Component } from 'react'
import TriviaContract from '../build/contracts/Trivia.json'
import getWeb3 from './utils/getWeb3'
import { Button, Row, Col, CardPanel } from 'react-materialize';

class App extends Component {
  constructor(props) {
    super(props)
    
    this.payEntryFee = this.payEntryFee.bind(this);
    this.giveAnswer = this.giveAnswer.bind(this);
    this.payPlayer = this.payPlayer.bind(this);

    this.state = {
      web3: null,
      contract: null,
      instance: null,
      owner: null,
      account: null,
      entryFee: 0,
      playerCount: 0,
      playerWinCount: 0,
      playerLossCount: 0,
      playerBalance: 0,
      question: '',
      correctAnswer: null,
      playerAnsweredCorrectly: false,
      playerEarnings: 0,
      answers: [],
      answerButtons: [],
      stage: 0
    }
  }

  componentWillMount() {
    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    const contract = require('truffle-contract')
    const trivia = contract(TriviaContract)
    trivia.setProvider(this.state.web3.currentProvider)
    
    //Set init state variables
    this.state.web3.eth.getAccounts((error, accounts) => {
      trivia.deployed().then((instance) => {
        this.setState({ account: accounts[0], contract: trivia, instance: instance })
        return this.state.instance.currentQuestion.call();
      }).then((result) => {
        this.setState({ question: result[0], correctAnswer: result[1], answers: shuffleArray(result.splice(1,3)) })
      })
    })    
  }

  componentDidMount() {
    this.updateState = setInterval(this.updateState.bind(this), 500)
    this.updateGame = setInterval(this.updateGame.bind(this), 1000)
  }

  componentWillUnmount () {
    clearInterval(this.updateState);
    clearInterval(this.updateGame);
  }

  updateState() {
    if (this.state.contract != null) {
      this.state.contract.deployed().then((instance) => {
        return this.state.instance.entryFee.call()
      }).then((result) => {
        this.setState({entryFee: result.c[0]})
        return this.state.instance.owner.call();
      }).then((result) => {
        this.setState({owner: result})
        return this.state.instance.getPlayerCount.call();
      }).then((result) => {
        this.setState({playerCount: result.c[0]})
      return this.state.instance.getPlayerWins.call(this.state.account);
      }).then((result) => {
        this.setState({playerWinCount: result.c[0]})
        return this.state.instance.getPlayerLosses.call(this.state.account);
      }).then((result) => {
        this.setState({playerLossCount: result.c[0]})
        return this.state.instance.earnings.call();
      }).then((result) => {
        this.setState({playerEarnings: result.c[0]})
        return this.state.instance.playerAnsweredCorrectly.call(this.state.account);
      }).then((result) => {
        this.setState({playerAnsweredCorrectly: result})
        return this.state.instance.stage.call()
      }).then((result) => {
        this.setState({stage: result.c[0]})
      })
      
      // Check if current user is owner of the contract
      if(this.state.owner === this.state.account) {
        this.setState({isOwner: true})
      }
      // For testing when changing accounts
      if (this.state.web3.eth.accounts[0] !== this.state.account) {
        this.setState({account: this.state.web3.eth.accounts[0]})
        window.location.reload()
      }
    }
  }

  updateGame() {
    let answerButtons = this.state.answers.map((answer) => {
      return(
        <div key={answer}>
          <Button
            onClick={(e) => this.giveAnswer(answer, e)}>{answer}
          </Button><br /><br />
        </div>
      )
    })
    this.setState({answerButtons: answerButtons});
  }

  payEntryFee(event) {
    event.preventDefault();

    this.state.instance.payEntryFee({ 
      gas: 3000000,
      from: this.state.account,
      value: this.state.web3.toWei(this.state.entryFee, 'ether')
    });
  }

  giveAnswer(answer, event) {
    event.preventDefault();

    this.state.instance.giveAnswer(answer, {
      gas: 3000000,
      from: this.state.account
    });
  }

  payPlayer(event) {
    event.preventDefault();

    this.state.instance.payPlayer({
      gas: 3000000,
      from: this.state.account
    });
  }

  render() {
    return (
      <div className="App">
        <main className="container">
          <Row>
            <Col m={6} s={12}>
              <CardPanel className="teal lighten-4 black-text">
                <strong>Game Info:</strong>
                <div>The Entry Fee is: {this.state.entryFee} ether</div>
                <div>Number of players: {this.state.playerCount}</div>
              </CardPanel>
            </Col>
            <Col m={6} s={12}>
              <CardPanel className="teal lighten-4 black-text">
                <strong>Player Info:</strong>
                <div>Wins: {this.state.playerWinCount}</div>
                <div>Losses: {this.state.playerLossCount}</div>
              </CardPanel>
            </Col>
          </Row>
          <Row className="center-align" hidden={this.state.stage !== 0}>
            <h1>Play Trivia for {this.state.entryFee} ether</h1>
            <p>Bet ether amongst opponent players and split the pot amongst the winners</p>
            <p>At least two players required to reveal next question</p>
            <p>The next question will be revealed shortly</p>
            <Button
              onClick={(e) => this.payEntryFee(e)}>Join Now
            </Button>
          </Row>
          <Row className="center-align" hidden={this.state.stage !== 1}>
            <h1>{this.state.question}</h1>
            {this.state.answerButtons}
          </Row>
          <Row className="center-align" hidden={this.state.stage !== 2}>
          <div hidden={!this.state.playerAnsweredCorrectly}>
            <h1>Correct! You won {this.state.playerEarnings/10000} ether.</h1>
            <Button
              onClick={(e) => this.payPlayer(e)}>Claim Winnings
            </Button>
          </div>
          <div className="center-align" hidden={this.state.playerAnsweredCorrectly}>
            <h1>Incorrect! Better Luck next time.</h1>
          </div>
          </Row>
        </main>
      </div>
    );
  }
}

function shuffleArray(array) {
  let i = array.length - 1;
  for (; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

export default App
