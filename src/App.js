import React, { Component } from 'react'
import TriviaContract from '../build/contracts/Trivia.json'
import getWeb3 from './utils/getWeb3'
import { Navbar, NavItem, Button, Row, Col, Input, CardPanel } from 'react-materialize';

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.giveAnswer = this.giveAnswer.bind(this);
    this.giveAnswer = this.giveAnswer.bind(this);
    this.setEntryFee = this.setEntryFee.bind(this);

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
    setInterval(this.updateState.bind(this), 500)
  }

  updateState() {
    if (this.state.contract != null) {
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
  }

  giveAnswer(index, event) {
    event.preventDefault();

    this.state.instance.giveAnswer(index, { 
      gas: 3000000,
      from: this.state.account,
      value: this.state.web3.toWei(this.state.entryFee, 'ether')
    });
  }

  submitQuestion(event){
    event.preventDefault();
    const data = new FormData(event.target);
    var question = data.get('question')
    var answer = data.get('answer')
    var incorrectOne = data.get('incorrectOne')
    var incorrectTwo = data.get('incorrectTwo')
    var incorrectThree = data.get('incorrectThree')
    console.log(question)
    console.log(answer)
    console.log(incorrectOne)
    console.log(incorrectTwo)
    console.log(incorrectThree)
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

  render() {
    return (
      <div className="App">
        <Navbar brand='Perpetual Decentralized Trivia' right>
          <NavItem onClick={() => console.log('test click')}>Getting started</NavItem>
          <NavItem href='components.html'>Components</NavItem>
        </Navbar>
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
          <form onSubmit={this.submitQuestion}>
            <p>Submit your own question:</p>
            <Input 
              s={3}
              id="question" 
              name="question" 
              type="text"
              placeholder="Question" />
            <p>Input the correct answer:</p>
            <Input 
              s={3}
              id="answer" 
              name="answer" 
              type="text"
              placeholder="Answer" />
            <p>Input three incorrect answers:</p>
            <Input 
              s={3}
              id="incorrect-one" 
              name="incorrectOne" 
              type="text" 
              placeholder="Incorrect Answer One"/>
            <Input 
              s={3}
              id="incorrect-two" 
              name="incorrectTwo" 
              type="text" 
              placeholder="Incorrect Answer Two"/>
            <Input 
              s={3}
              id="incorrect-three" 
              name="incorrectThree" 
              type="text" 
              placeholder="Incorrect Answer Three"/>
            <Button>Submit</Button>
          </form>
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
