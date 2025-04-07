// import React, { useEffect, useState } from 'react'
// import { useAuth } from '../auth'
// import { Modal , Card, Form,Button} from 'react-bootstrap'
// import { useNavigate } from 'react-router-dom';
// import { useInputData } from '../components/useInputData';
// import "../styles/Home.css"

// const LoggedinHome = ({onClick,onDelete}) => {
//   const navigate = useNavigate();
//   const { setTestId, setBacteriaName, setTestData } = useInputData();
  
//   const handleCardClick = (testId, bacteriaName, testData) => {
//     setTestId(testId);
//     setBacteriaName(bacteriaName);
//     setTestData(testData)

//     navigate(`/result/${testId}`);
//   };

//   const [test,setTest]=useState([]);

//   useEffect(
//     ()=>{
//       fetch('http://localhost:3001/ASTtest/get_test_data')
//       .then(res=>res.json())
//       .then(data=>{
//         console.log(data)
//         setTest(data)
//       })
//       .catch(err=>console.log(err))
//     },{}
//   );

//   return (
//     <div className="testlist">
//       {test.map((testItem) => (
//         <Card
//           key={testItem.test_id}
//           onClick={() => handleCardClick(testItem.test_id)}
//           style={{ cursor: 'pointer' }}
//           className="new-test-item"
//         >
//           <Card.Body>
//             <p className="test-id">Test ID : {testItem.test_id}</p>
//             <p className="performed-by">Performed by : {testItem.username}</p>
//             <p className="bacteria-name">Bacteria Name : {testItem.bacteria_name}</p>
//           </Card.Body>
//         </Card>
//       ))}
//     </div>
//   );
// }

// const LoggedOutHome = () => {
//   const navigate = useNavigate();
//   const handleCardClick = () => {
//     alert("Please Log in")
//   };

//   const [test,setTest]=useState([]);
//   useEffect(
//     ()=>{
//       fetch('http://localhost:3000/ASTtest/get_test_data')
//       .then(res=>res.json())
//       .then(data=>{
//         console.log(data)
//         setTest(data)
//       })
//       .catch(err=>console.log(err))
//     },{}
//   );

//   return (
//     <div className="testlist">
//       {test.map((testItem) => (
//       <Card key={testItem.test_id} onClick={handleCardClick} style={{ cursor: 'pointer' }} className="new-test-item">
//       <Card.Body>
//         <p className="test-id">Test ID : {testItem.test_id}</p>
//         <p className="performed-by">Performed by : {testItem.username}</p>
//         <p className="bacteria-name">Bacteria Name : {testItem.bacteria_name}</p>
//       </Card.Body>
//       </Card>
//     ))}
//     </div>
//   )
// }

// const HomePage=()=> {

//   const [logged] = useAuth();
//   console.log("Logged in:", logged);

//   return (
//     <div>
//       {logged ? <LoggedinHome /> : <LoggedOutHome />}
//     </div>
//   );
// }

// export default HomePage;



import React, { useEffect, useState } from "react";
import { useAuth } from "../auth";
import { Modal, Card, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useInputData } from "../components/useInputData";
import "../styles/Home.css";

const LoggedinHome = ({ onClick, onDelete }) => {
  const navigate = useNavigate();
  const { setTestId, setBacteriaName, setTestData } = useInputData();

  const handleCardClick = (testId, bacteriaName, testData) => {
    setTestId(testId);
    setBacteriaName(bacteriaName);
    setTestData(testData);

    navigate(`/result/${testId}`);
  };

  const [test, setTest] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/ASTtest/get_test_data")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setTest(data);
      })
      .catch((err) => console.log(err));
  }, {});

  return (
    <div className="testlist">
      {test.map((testItem) => (
        <Card
          key={testItem.test_id}
          onClick={() => handleCardClick(testItem.test_id)}
          style={{ cursor: "pointer" }}
          className="new-test-item"
        >
          <Card.Body>
            <p className="test-id">Test ID : {testItem.test_id}</p>
            <p className="performed-by">Performed by : {testItem.username}</p>
            <p className="bacteria-name">
              Bacteria Name : {testItem.bacteria_name}
            </p>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

const LoggedOutHome = () => {
  const navigate = useNavigate();
  const handleCardClick = () => {
    alert("Please Log in");
  };

  const [test, setTest] = useState([]);
  useEffect(() => {
    fetch("http://localhost:3000/ASTtest/get_test_data")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setTest(data);
      })
      .catch((err) => console.log(err));
  }, {});

  return (
    <div className="testlist">
      {test.map((testItem) => (
        <Card
          key={testItem.test_id}
          onClick={handleCardClick}
          style={{ cursor: "pointer" }}
          className="new-test-item"
        >
          <Card.Body>
            <p className="test-id">Test ID : {testItem.test_id}</p>
            <p className="performed-by">Performed by : {testItem.username}</p>
            <p className="bacteria-name">
              Bacteria Name : {testItem.bacteria_name}
            </p>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

const HomePage = () => {
  /**
   * !  เพิ่ม localStorage
   * */
  localStorage.setItem("edit_status", false);
  const [logged] = useAuth();
  console.log("Logged in:", logged);

  return <div>{logged ? <LoggedinHome /> : <LoggedOutHome />}</div>;
};

export default HomePage;

