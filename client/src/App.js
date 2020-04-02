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

import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import Prism from 'prismjs';

const code_default = `/* Your code here */
function add(a, b) {
  return a + b;
}
`;


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
      code_value: code_default,
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

  handleCodeChange = (value) => {
    this.setState({
      code_value: value
    });
  };

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
          </label>
          <Editor
            name="code_value" 
            value={this.state.code_value}
            onValueChange={this.handleCodeChange}
            highlight={code => highlight(code, languages.clike)}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 12,
            }}
          />
          {/* <textarea name="code_value" value={this.state.code_value} onChange={this.handleChange} /> */}
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
    setTimeout(() => Prism.highlightAll(), 1);
  }

  render() {
    if (this.state.succeeded) {
      return (
        <div className='display-linebreak'>
          <label>
            Code: <br />
            <pre className="line-numbers">
              <code className="language-js">
                {this.state.snip_code}
              </code>
            </pre>
            <br />
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
