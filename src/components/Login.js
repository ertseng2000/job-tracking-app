import React, {Component} from 'react';
import { Link } from "react-router-dom";
import './Login.css';

class Login extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return(
      <>
        <h1>Login Page</h1>
        <nav>
          <Link to="/calendar">Calendar</Link>
        </nav>
      </>
    );
  }
}
export default Login
