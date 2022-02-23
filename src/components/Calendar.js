import React, {Component} from 'react';
import { Link } from "react-router-dom";
import './Login.css';

class Calendar extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return(
      <>
        <h1>Calendar Page</h1>
        <nav>
          <Link to="/login">Login</Link>
        </nav>
      </>
    );
  }
}
export default Calendar
