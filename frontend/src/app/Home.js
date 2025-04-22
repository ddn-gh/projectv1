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
//       fetch('https://asttestapp.onrender.com/ASTtest/get_test_data')
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
import { Modal, Card, Button, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useInputData } from "../components/useInputData";
import "../styles/Home.css";
import { FaEllipsisV } from 'react-icons/fa'; // Three-dot icon

const LoggedinHome = ({ onClick, onDelete }) => {
  const navigate = useNavigate();
  const { setTestId, setBacteriaName, setTestData } = useInputData();
  const [test, setTest] = useState([]);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);

  const handleCardClick = (testId, bacteriaName, testData, e) => {
    if (e.target && e.target.closest('.three-dot-icon')) {
      return;
    }
    setTestId(testId);
    setBacteriaName(bacteriaName);
    setTestData(testData);
    navigate(`/result/${testId}`);
  };


  useEffect(() => {
    fetch("https://asttestapp.onrender.com/ASTtest/get_test_data")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setTest(data);
      })
      .catch((err) => console.log(err));
  }, {});


  const handleDelete = (testId, e) => {
    e.stopPropagation();

    fetch(`https://asttestapp.onrender.com/ASTtest/get_test_data_by_Id/${testId}`, {
      method: 'DELETE',
    })
      .then(() => {
        setTest(test.filter(testItem => testItem.test_id !== testId)); // Remove deleted test from state
        setShowDropdown(null);
      })
      .catch((err) => console.log(err));
  };
  const handleDeleteDropdownShow = (testId) => {
    setTestToDelete(testId); 
    setShowDropdown(null);
  };

  return (
    <div className="testlist">
      {test.map((testItem) => (
        <Card
          key={testItem.test_id}
          onClick={(e) => handleCardClick(testItem.test_id, testItem.bacteria_name, testItem.test_data, e)} // Pass the event here
          style={{ cursor: "pointer", position: "relative" }}
          className="new-test-item"
        >
          <Card.Body>
            <p className="test-id">Test ID : {testItem.test_id}</p>
            <p className="performed-by">Performed by : {testItem.username}</p>
            <p className="bacteria-name">
              Bacteria Name : {testItem.bacteria_name}
            </p>

            {/* Three-dot Icon for Settings */}
            <FaEllipsisV
              className="three-dot-icon"
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                cursor: "pointer",
                fontSize: "20px",
              }}
              onClick={() => setShowDropdown(testItem.test_id === showDropdown ? null : testItem.test_id)} // Toggle dropdown visibility
            />

            {/* Custom Dropdown for Delete Confirmation */}
            {showDropdown === testItem.test_id && (
              <div style={{ position: "absolute", top: 30, right: 10, backgroundColor: "#fff", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", borderRadius: "5px", zIndex: 10 }}>
                <button className="delete-test-button"
                  style={{ padding: "10px", border: "none", background: "none", cursor: "pointer" }}
                  onClick={(e) => handleDelete(testItem.test_id, e)} // Pass event to stop propagation
                >
                  Delete This Test
                </button>
              </div>
            )}
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
    fetch("https://asttestapp.onrender.com/ASTtest/get_test_data")
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

