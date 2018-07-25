import React, { Component } from 'react'
import { Input, Button } from 'react-materialize';

class QuestionSubmit extends Component {

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
