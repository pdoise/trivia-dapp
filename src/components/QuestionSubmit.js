import React, { Component } from 'react'
import { Input, Button } from 'react-materialize';
import QuestionContract from '../../build/contracts/QuestionFactory.json'
import getWeb3 from './../utils/getWeb3'

class QuestionSubmit extends Component {

  constructor(props) {
    super(props)

    this.submitQuestion = this.submitQuestion.bind(this);

    this.state = {
      web3: null,
      contract: null,
      instance: null,
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
    const question = contract(QuestionContract)
    question.setProvider(this.state.web3.currentProvider)
    
    //Set init state variables
    this.state.web3.eth.getAccounts((error, accounts) => {
      question.deployed().then((instance) => {
        return this.setState({ account: accounts[0], contract: question, instance: instance })
      })
    })
  }

  submitQuestion(event){
    event.preventDefault();
    const data = new FormData(event.target);
    var question = data.get('question')
    var answer = data.get('answer')
    var incorrectOne = data.get('incorrectOne')
    var incorrectTwo = data.get('incorrectTwo')
    var incorrectThree = data.get('incorrectThree')
    event.preventDefault();

    this.state.instance.createQuestion(question, answer, incorrectOne, incorrectTwo, incorrectThree, { 
      gas: 3000000,
      from: this.state.account
    });
  }

  render() {
    return (
      <div className="App">
        <main className="container">
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
        </main>
      </div>
    );
  }
}

module.exports = {
  QuestionSubmit
};
