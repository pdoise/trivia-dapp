import React, { Component } from 'react'
import TriviaContract from '../../build/contracts/Trivia.json'
import getWeb3 from '../utils/getWeb3'
import { Button, Input } from 'react-materialize';

class Admin extends Component {
  constructor(props) {
    super(props)

    this.setEntryFee = this.setEntryFee.bind(this);
    this.approveQuestion = this.approveQuestion.bind(this);
    this.rejectUnapprovedQuestion = this.rejectUnapprovedQuestion.bind(this);

    this.state = {
      web3: null,
      contract: null,
      instance: null,
      account: null,
      owner: null,
      isOwner: false,
      entryFee: 0,
      updateState: null,
      unapprovedQuestion: ""
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
      })
    })
  }

  componentDidMount() {
    this.updateState = setInterval(this.updateState.bind(this), 500)
  }

  componentWillUnmount () {
    clearInterval(this.updateState);
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
        return this.state.instance.unapprovedQuestions.call(0);
      }).then((result) => {
        this.setState({unapprovedQuestion: result});
      })
      // For testing when changing accounts
      if (this.state.web3.eth.accounts[0] !== this.state.account) {
        this.setState({account: this.state.web3.eth.accounts[0]});
        window.location.reload();
      }
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

  approveQuestion(){
    event.preventDefault();

    this.state.instance.approveQuestion(this.state.unapprovedQuestion[0], {
      gas: 3000000,
      from: this.state.account
    });
  }

  rejectUnapprovedQuestion(){
    event.preventDefault();

    this.state.instance.rejectUnapprovedQuestion(this.state.unapprovedQuestion[0], {
      gas: 3000000,
      from: this.state.account
    });
  }

  render() {
    return (
      <div className="App">
        <main className="container">
          <form onSubmit={this.setEntryFee}>
            <h3>Admin Funtions:</h3>
            <Input 
              s={3}
              id="entryfee" 
              name="entryfee" 
              type="number"
              placeholder="Set Entry Fee in ether" />
            <Button>Submit</Button>
          </form>
          <div><br /><br />
            <strong>Unapproved questions:</strong>
            <p>{this.state.unapprovedQuestion[0]}</p>
            <p>{this.state.unapprovedQuestion[1]}</p>
            <p>{this.state.unapprovedQuestion[2]}</p>
            <p>{this.state.unapprovedQuestion[3]}</p>
            <Button onClick={(e) => this.approveQuestion(e)}>Approve Question</Button><br /><br />
            <Button onClick={(e) => this.rejectUnapprovedQuestion(e)}>Reject Question</Button>
          </div>
        </main>
      </div>
    );
  }
}

module.exports = {
  Admin
};
