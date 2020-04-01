import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import {withRouter} from 'react-router';
import './App.css';
import { functionDeclaration } from '@babel/types';

function App() {
  let state = {users: []};


  return (
    <Router>
      <Switch>
        <Route path='/:snip_id' component={ViewSnip}/>
        <Route path='/'>
          <CreateSnip />
        </Route>
      </Switch>
    </Router>
  );
}

class CreateSnipForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code_value: '/* Your CodeSnip goes here */',
      commentary: 'Your commentary goes here.',
      custom_url: '',
      submitted: null
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    const snip_params = {
      code: this.state.code_value,
      commentary: this.state.commentary,
      custom_id: this.state.custom_url
    };
    fetch('http://localhost:3001/create', { headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }, method: 'post', body: JSON.stringify(snip_params)
    }).then((response) => {
      return response.json();
    }).then((data) => {
      console.log(data.message);
      this.setState({submitted: data.message})
    });
  }

  render() {
    if (!this.state.submitted)
      return (
        <form onSubmit={this.handleSubmit.bind(this)}>
          <label>
            Code Snippet: <br />
            <textarea name="code_value" value={this.state.code_value} onChange={this.handleChange} />
          </label>
          <br />
          <label>
            Commentary: <br />
            <textarea name="commentary" value={this.state.commentary} onChange={this.handleChange} />
          </label>
          <br />
          <label>
            Custom URL (optional): https://snip.uno/
            <input name="custom_url" type="text" value={this.state.custom_url} onChange={this.handleChange} />
          </label>
          <input type="submit" value="Submit" />
        </form>
      );
    else {
        let new_dest = '/' + this.state.submitted;
        return (<Redirect to={new_dest} />);
    }
  }
}

function CreateSnip() {
  return (
    <div>
      <h1>Create a Shareable Code Snippet</h1>
      <CreateSnipForm />
    </div>
  );
}

class ViewSnip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      snip_code: '',
      snip_commentary: '',
      succeeded: true
    };
  }

  componentDidMount() {
    const snip_id = this.props.match.params.snip_id;
    fetch(`http://localhost:3001/view/${snip_id}`, { headers: {
      'Accept': 'text/plain',
      'Content-Type': 'text/plain'
    }, method: 'GET' 
      }).then((response) => {
          return response.json();
      }).then((data) => {
        this.setState({
          snip_code: data.code,
          snip_commentary: data.commentary
        });
      });
  }

  render() {
    if (this.state.succeeded) {
      return (
        <div className='display-linebreak'>
          <label>
            Code: <br />
            {this.state.snip_code} <br />
          </label>
          <br />
          <label>
            Commentary: <br />
            {this.state.snip_commentary} <br />
          </label>
        </div>  
      );
    } else {
      return (
        <div>
          This CodeSnip does not exist.
        </div>
      );
    }
  }
}

export default App;
