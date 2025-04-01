import React from 'react';
import { Link } from 'react-router-dom'
import { useAuth ,logout} from '../auth'
import "../styles/Navbar.css"

const LoggedInLinks=()=> {
  return (
    <>
    <li className="nav-item">
      <Link className="nav-link active" to="/">Home</Link>
    </li>
    <li className="nav-item">
      <Link className="nav-link active" to="/createnewtest">Create new test</Link>
    </li>
    <li className="nav-item">
      <Link className="nav-link active" to="/report">View Report</Link>
    </li>
    <li className="nav-item">
      <a className="nav-link active" href="#" onClick={()=>{logout()}}>Log Out</a>
    </li>
    </>
  )
}

const LoggedOutLinks = () => {
  return (
      <>
          <li className="nav-item">
              <Link className="nav-link active" to="/">Home</Link>
          </li>
          <li className="nav-item">
              <Link className="nav-link active" to="/signup">Sign Up</Link>
          </li>
          <li className="nav-item">
              <Link className="nav-link active" to="/login" >Login</Link>
          </li>
      </>
  )
}

const Navbar = () => {

  const [logged] = useAuth();

  return (
    <nav className="navbar navbar-expand-lg">
      
      <button 
        className="navbar-toggler" 
        type="button" 
        data-toggle="collapse" 
        data-target="#navbarNav" 
        aria-controls="navbarNav" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav">
          {logged?<LoggedInLinks/>:<LoggedOutLinks/>}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
