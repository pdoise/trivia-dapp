import React, { Component } from 'react'
import TriviaContract from '../../build/contracts/Trivia.json'
import { Navbar, NavItem } from 'react-materialize';
import { LinkContainer } from 'react-router-bootstrap';
import getWeb3 from '../utils/getWeb3'

class Nav extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      contract: null,
      instance: null,
      owner: null,
      isOwner: false,
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
        return this.state.instance.owner.call();
      }).then((result) => {
        this.setState({owner: result});
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


  render() {
    return (
      <Navbar brand='Perpetual Decentralized Trivia' right>
        <LinkContainer to="/admin" hidden={!this.state.isOwner}>
          <NavItem>Admin</NavItem>
        </LinkContainer>
        <LinkContainer to="/question_submit">
          <NavItem>Submit Questions</NavItem>
        </LinkContainer>
      </Navbar>
    );
  }
}

module.exports = {
  Nav
};
