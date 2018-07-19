import React, { Component } from 'react'
import TriviaContract from '../build/contracts/Trivia.json'
import getWeb3 from './utils/getWeb3'
import { Button, Row, Col, Input, CardPanel } from 'react-materialize';

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      contract: null,
      instance: null,
      owner: null,
      isOwner: false,
      account: null,
      entryFee: 0,
      playerCount: 0,
      playerWinCount: 0,
      playerLossCount: 0,
      question: '',
      answers: [],
      correctAnswer: null
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
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
        return this.setState({ account: accounts[0], contract: trivia, instance: instance })
      })
    })

    //Retrieve trivia questions from api and display them
    fetch('https://opentdb.com/api.php?amount=1&category=9&type=multiple').then(results => {
      return results.json();
    }).then(data => {
      this.setState({question: data.results[0].question})
      let allAnswers = data.results[0].incorrect_answers
      let correctAnswer = data.results[0].correct_answer
      allAnswers.push(correctAnswer)
      shuffleArray(allAnswers)

      allAnswers.map(function(answer){
        if (answer === correctAnswer) {
          return answer
        }
      })
      let answers = allAnswers.map((answer, index) => {
        return(
          <div key={answer}>
            <Button
              onClick={(e) => this.giveAnswer(index, e)}>{answer}
            </Button><br /><br />
          </div>
        )
      })
      this.setState({answers: answers})
    })
    
    //Watchers
    setInterval(this.updateState.bind(this), 100)

    //Bind methods
    this.setEntryFee = this.setEntryFee.bind(this);
    this.giveAnswer = this.giveAnswer.bind(this);
  }

  updateState() {
    this.state.contract.deployed().then((instance) => {
      return this.state.instance.entryFee.call();
    }).then((result) => {
      this.setState({entryFee: result.c[0]});
      return this.state.instance.owner.call();
    }).then((result) => {
      this.setState({owner: result});
      return this.state.instance.getPlayerCount.call();
    }).then((result) => {
      this.setState({playerCount: result.c[0]});
    })
    
    // Check if current user is owner of the contract
    if(this.state.owner === this.state.account) {
      this.setState({isOwner: true});
    }
    // For testing when changing accounts
    if (this.state.web3.eth.accounts[0] !== this.state.account) {
      this.setState({account: this.state.web3.eth.accounts[0]});
      window.location.reload();
    }
  }

  setEntryFee(event){
    event.preventDefault();
    const data = new FormData(event.target);
    var value = data.get('entryfee')

    this.state.instance.setEntryFee(value, {from: this.state.account})
    .then(result => {
      return this.state.instance.entryFee.call()
    }).then(result => {
      this.setState({entryFee: result.c[0]})
    })
  }

  giveAnswer(index, event) {
    event.preventDefault();

    this.state.instance.giveAnswer(index, { 
      gas: 3000000,
      from: this.state.account,
      value: this.state.web3.toWei(this.state.entryFee, 'ether')
    });
  }

  render() {
    return (
      <div className="App">
        <nav>
          <div className="nav-wrapper">
            <a className="brand-logo center">Perpetual Decentralized Trivia</a>
          </div>
        </nav>
        <main className="container">
          <Row className="center-align">
            <h1 dangerouslySetInnerHTML={{ __html: this.state.question}}></h1>
            {this.state.answers}
          </Row>
          <Row>
            <Col m={6} s={12}>
              <CardPanel className="teal lighten-4 black-text">
                <strong>Game Info</strong>
                <div>The Entry Fee is: {this.state.entryFee} ether</div>
                <div>Number of players: {this.state.playerCount}</div>
              </CardPanel>
            </Col>
            <Col m={6} s={12}>
              <CardPanel className="teal lighten-4 black-text">
                <strong>Player Info</strong>
                <div>Wins: {this.state.playerWinCount}</div>
                <div>Losses: {this.state.playerLossCount}</div>
              </CardPanel>
            </Col>
          </Row>
          <form onSubmit={this.setEntryFee} hidden={!this.state.isOwner}>
            <p>Admin Funtions:</p>
            <Input 
              s={3}
              id="entryfee" 
              name="entryfee" 
              type="number"
              placeholder="Set Entry Fee in ether" />
            <Button>Submit</Button>
          </form>
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
