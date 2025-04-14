// import React, { useState } from 'react'
// import { Form, Button } from 'react-bootstrap'
// import { useForm } from 'react-hook-form'
// import { useNavigate } from 'react-router-dom'
// import { useInputData } from '../components/useInputData';
// import '../styles/CreateNewTestPage.css';

// const CreateNewTestPage = () => {
//     const { register, handleSubmit, reset, formState: { errors } } = useForm()
//     const navigate = useNavigate();
//     const { testId, setTestId, bacteria, setBacteriaName } = useInputData();

//     const createNewTest = async () => {

//         const payload = {
//             test_id: testId,      
//             bacteria: bacteria, 
//         };

//         const token = localStorage.getItem('REACT_TOKEN_AUTH_KEY');
//         console.log(token)

//         const requestOptions = {
//             method: 'POST',
//             headers: {
//                 'content-type': 'application/json',
//                 'Authorization': `Bearer ${JSON.parse(token)}`,
//             },
//             body: JSON.stringify(payload)
//         }

//             try {
//                 const response = await fetch(`http://localhost:3001/ASTtest/get_test_data`, requestOptions);
          
//                 if (!response.ok) {
//                   if (response.status === 401) {
//                     alert('Session expired, please log in again');
//                     navigate('/login');
//                   }
//                   throw new Error('Failed to create test');
//                 }
          
//                 const result = await response.json();
//                 console.log('Test created:', result);
//                 navigate('/import');
          
//               } catch (error) {
//                 console.error('Error:', error);
//                 alert('Failed to create test');
//               }
//     }

//     return (
//         <div className='createnewtest'>
//             <h1>Create New Test</h1>

//             <form onSubmit={handleSubmit(createNewTest)}>
//                 <Form.Group>
//                     <Form.Label>Test id</Form.Label>
//                     <Form.Control 
//                         type="number"
//                         {...register('testId', { required: true, maxLength: 10, onChange: (e) => setTestId(e.target.value) })}
                        
//                     />
//                 </Form.Group>
//                 {errors['testId'] && <p style={{ color: 'red' }}><small>Test id is required</small></p>}
//                 {errors['testId']?.type === "maxLength" && <p style={{ color: 'red' }}>Test id cannot exceed 10 characters</p>}

//                 <Form.Group>
//                     <Form.Label>Bacteria Name</Form.Label>
//                     <Form.Control 
//                         as="select"
//                         {...register('bacteria', { required: true , onChange: (e) => setBacteriaName(e.target.value)})}
//                     >
//                         <option value="">Select a bacteria</option>
//                         <option value="Enterobacterales">Enterobacterales</option>
//                         <option value="Pseudomonas aeruginosa">Pseudomonas aeruginosa</option>
//                         <option value="Acinetobacter spp.">Acinetobacter spp.</option>
//                         <option value="Burkholderia cepacia complex">Burkholderia cepacia complex</option>
//                         <option value="Stenotrophomonas maltophilia">Stenotrophomonas maltophilia</option>
//                         <option value="Enterococcus spp.">Enterococcus spp.</option>
//                         <option value="Haemophilus influenzae and Haemophilus parainfluenzae">Haemophilus influenzae and Haemophilus parainfluenzae</option>
//                     </Form.Control>
//                 </Form.Group>
//                 {errors['bacteria'] && <p style={{ color: 'red' }}><small>Bacteria name is required</small></p>}
                
//                 <br />

//                 <div className="button-container">
//                     <Button 
//                         variant="primary" 
//                         onClick={handleSubmit(createNewTest)} 
//                         className="button"
//                     >
//                         NEXT
//                     </Button>
//                 </div>
//             </form>
//             {}
//             {}
//         </div>
//     );
// }

// export default CreateNewTestPage;


import React from "react";
import { Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useInputData } from "../components/useInputData";
import "../styles/CreateNewTestPage.css";
import { authFetch, login } from "../auth";

const CreateNewTestPage = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const { testId, setTestId, bacteria, setBacteriaName } = useInputData();

  const handleLoginRefresh = (data) => {
    // ใช้กรณี token หมดอายุ
    localStorage.setItem("auth", JSON.stringify(data));
    fetch("http://localhost:3001/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.access_token) {
          login(data.access_token);
          createNewTest(); // ลองส่งใหม่อีกครั้ง
        } else {
          alert("Invalid username or password");
        }
      });
  };

  const createNewTest = async () => {
    localStorage.setItem("testId", testId);
    const payload = {
      test_id: testId,
      bacteria: bacteria,
    };

    try {
      const response = await authFetch(
        `http://localhost:3001/ASTtest/get_test_data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );


      if (!response.ok) {
        if (response.status === 401) {
          const authData = JSON.parse(localStorage.getItem("auth"));
          if (authData) handleLoginRefresh(authData);
        } else if (response.status === 400) {
          const result = await response.json();
          alert(
            result.message ||
              "Test ID already exist"
          );
        } else {
          alert("Error : try again");
        }
        return;
      }

      const result = await response.json();
      navigate("/import");
    } catch (error) {
      console.error("Error:", error);
      alert("Server error");
    }
  };

  return (
    <div className="createnewtest">
      <h1>Create New Test</h1>

      <form onSubmit={handleSubmit(createNewTest)}>
        <Form.Group>
          <Form.Label>Test id</Form.Label>
          <Form.Control
            type="number"
            {...register("testId", {
              required: true,
              maxLength: 10,
              onChange: (e) => setTestId(e.target.value),
            })}
          />
          {errors.testId && (
            <p style={{ color: "red" }}>
              <small>Test id is required</small>
            </p>
          )}
          {errors.testId?.type === "maxLength" && (
            <p style={{ color: "red" }}>Test id cannot exceed 10 characters</p>
          )}
        </Form.Group>

        <Form.Group>
          <Form.Label>Bacteria Name</Form.Label>
          <Form.Control
            as="select"
            {...register("bacteria", {
              required: true,
              onChange: (e) => setBacteriaName(e.target.value),
            })}
          >
            <option value="">Select a bacteria</option>
            <option value="Enterobacterales">Enterobacterales</option>
            <option value="Pseudomonas aeruginosa">Pseudomonas aeruginosa</option>
            <option value="Acinetobacter spp.">Acinetobacter spp.</option>
            <option value="Streptococcus pneumoniae">Streptococcus pneumoniae</option>
            <option value="Neisseria gonorrhoeae">Neisseria gonorrhoeae</option>
            <option value="Burkholderia cepacia complex">Burkholderia cepacia complex</option>
            <option value="Stenotrophomonas maltophilia">Stenotrophomonas maltophilia</option>
            <option value="Enterococcus spp.">Enterococcus spp.</option>
            <option value="Haemophilus influenzae and Haemophilus parainfluenzae">
              Haemophilus influenzae and Haemophilus parainfluenzae
            </option>
          </Form.Control>
          {errors.bacteria && (
            <p style={{ color: "red" }}>
              <small>Bacteria name is required</small>
            </p>
          )}
        </Form.Group>

        <br />

        <div className="button-container">
          <Button type="submit" variant="primary" className="button">
            NEXT
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateNewTestPage;
