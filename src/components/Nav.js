import React, { Component } from 'react'
import { Navbar, NavItem } from 'react-materialize';
import { LinkContainer } from 'react-router-bootstrap';

class Nav extends Component {

  render() {
    return (
      <Navbar brand='Perpetual Decentralized Trivia' right>
        <LinkContainer to="/admin">
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
