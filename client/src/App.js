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
import Highlight from 'react-highlight';
import '../node_modules/highlight.js/styles/github.css';
import { render } from "react-dom";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-swift";
import "ace-builds/src-noconflict/mode-mysql";
import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/mode-rust";
import "ace-builds/src-noconflict/mode-perl";
import "ace-builds/src-noconflict/mode-scheme";
import "ace-builds/src-noconflict/mode-python";




import "ace-builds/src-noconflict/theme-github";


const code_default = `/* Your code here */
function add(a, b) {
  return a + b;
}
`;

const language_map = {
  "python": "python",
  "c_cpp": "C++",
  "java": "java",
  "javascript": "javascript",
  "golang": "golang",
  "rust": "rust",
  "perl": "perl",
  "scheme": "scheme",
  "mysql": "mysql",
  "html": "html",
  "css": "css",
  "swift": "swift"
};

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
      language: 'c_cpp',
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
      custom_id: this.state.custom_url,
      lang: this.state.language
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
            Language:
            <select name="language" value={this.state.language} onChange={this.handleChange}>
              <option value="cpp_cp">C/C++</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="javascript">Javascript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="golang">Golang</option>
              <option value="rust">Rust</option>
              <option value="swift">Swift</option>
              <option value="mysql">MySQL</option>
              <option value="scheme">Scheme</option>
              <option value="perl">Perl</option>
            </select>
          </label>
          <br />
          <label>
            Code Snippet: <br />
          </label>
          <AceEditor
            mode={this.state.language}
            theme="github"
            onChange={this.handleCodeChange}
            name="code_value"
            value={this.state.code_value}
            editorProps={{ $blockScrolling: true }}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 12,
              height: 250
            }}
          
          />
          <br />
          <label>
            Commentary: <br />
            <textarea name="commentary" value={this.state.commentary} onChange={this.handleChange}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 12,
                height: 250,
                width: 500
              }}
            />
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
          snip_commentary: data.commentary,
          language: language_map[data.language]
        });
      });
  }

  render() {
    if (this.state.succeeded) {
      return (
        <div className='display-linebreak'>
          <label>
            Code: <br />
            <Highlight className={this.state.language}>
              {this.state.snip_code}
            </Highlight>
            <br />
          </label>
          <br />
          <label>
            Commentary: <br /> <br />
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
