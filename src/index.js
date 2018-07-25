import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route } from 'react-router-dom';

import { Nav } from './components/Nav';
import App from './App'
import { Admin } from './components/Admin';
import { QuestionSubmit } from './components/QuestionSubmit';

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

ReactDOM.render(
  <Router>
      <div>
        <Route path="*" component={Nav} />
        <Route exact path="/" component={App} />
        <Route path="/admin" component={Admin} />
        <Route path="/question_submit" component={QuestionSubmit} />
      </div>
  </Router>,
  document.getElementById('root')
)