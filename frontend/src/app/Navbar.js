// import React from 'react';
// import { Link } from 'react-router-dom'
// import { useAuth ,logout} from '../auth'
// import "../styles/Navbar.css"

// const LoggedInLinks=()=> {
//   return (
//     <>
//     <li className="nav-item">
//       <Link className="nav-link active" to="/">Home</Link>
//     </li>
//     <li className="nav-item">
//       <Link className="nav-link active" to="/createnewtest">Create new test</Link>
//     </li>
//     <li className="nav-item">
//       <Link className="nav-link active" to="/report">View Report</Link>
//     </li>
//     <li className="nav-item">
//       <a className="nav-link active" href="#" onClick={()=>{logout()}}>Log Out</a>
//     </li>
//     </>
//   )
// }

// const LoggedOutLinks = () => {
//   return (
//       <>
//           <li className="nav-item">
//               <Link className="nav-link active" to="/">Home</Link>
//           </li>
//           <li className="nav-item">
//               <Link className="nav-link active" to="/signup">Sign Up</Link>
//           </li>
//           <li className="nav-item">
//               <Link className="nav-link active" to="/login" >Login</Link>
//           </li>
//       </>
//   )
// }

// const Navbar = () => {

//   const [logged] = useAuth();

//   return (
//     <nav className="navbar navbar-expand-lg">
      
//       <button 
//         className="navbar-toggler" 
//         type="button" 
//         data-toggle="collapse" 
//         data-target="#navbarNav" 
//         aria-controls="navbarNav" 
//         aria-expanded="false" 
//         aria-label="Toggle navigation"
//       >
//         <span className="navbar-toggler-icon"></span>
//       </button>
      
//       <div className="collapse navbar-collapse" id="navbarNav">
//         <ul className="navbar-nav">
//           {logged?<LoggedInLinks/>:<LoggedOutLinks/>}
//         </ul>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;




import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth, logout } from "../auth";
import "../styles/Navbar.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Navbar = () => {
  const [logged] = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = () => {
    setIsOpen(false); // ปิดเมนู
    window.scrollTo(0, 0); // เลื่อนกลับบนสุด (optional)
  };
  const toggleNavbar = () => setIsOpen(!isOpen);

  const LoggedInLinks = () => (
    <>
      <li className="nav-item">
        <Link className="nav-link active" to="/" onClick={handleNavClick}>
          Home
        </Link>
      </li>
      <li className="nav-item" onClick={handleNavClick}>
        <Link className="nav-link active" to="/createnewtest">
          Create new test
        </Link>
      </li>
      <li className="nav-item" onClick={handleNavClick}>
        <Link className="nav-link active" to="/report">
          View Report
        </Link>
      </li>
      <li className="nav-item">
        <a
          className="nav-link active"
          href="#"
          onClick={() => {
            logout();
            handleNavClick();
            localStorage.removeItem("auth"); // ถ้าใช้ Local Storage
          }}
        >
          Log Out
        </a>
      </li>
    </>
  );

  const LoggedOutLinks = () => (
    <>
      <li className="nav-item">
        <Link className="nav-link active" to="/" onClick={handleNavClick}>
          Home
        </Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link active" to="/signup" onClick={handleNavClick}>
          Sign Up
        </Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link active" to="/login" onClick={handleNavClick}>
          Login
        </Link>
      </li>
    </>
  );

  return (
    <nav className="navbar navbar-expand-lg">
      <button
        className="navbar-toggler"
        type="button"
        onClick={toggleNavbar}
        aria-controls="navbarNav"
        aria-expanded={isOpen}
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div
        className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}
        id="navbarNav"
      >
        <ul className="navbar-nav">
          {logged ? <LoggedInLinks /> : <LoggedOutLinks />}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
