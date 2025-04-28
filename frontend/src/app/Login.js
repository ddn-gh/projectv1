// import React, { useState } from 'react'
// import { Form, Button, Alert } from 'react-bootstrap'
// import { Link } from 'react-router-dom'
// import { useForm } from 'react-hook-form'
// import { login } from '../auth'
// import { useNavigate } from 'react-router-dom'

// const LoginPage=()=> {

//   const {register,handleSubmit,reset,formState:{errors}} = useForm()
//   const navigate = useNavigate()

//   const loginUser=(data)=> {
//     console.log(data)

//     const requestOptions={
//       method:"POST",
//       headers:{
//         'content-type':'application/json'
//       },
//       body:JSON.stringify(data)
//     }

//     fetch('https://asttestapp.onrender.com/auth/login',requestOptions)
//     .then(res=>res.json())
//     .then(data=>{
//         console.log(data.access_token)
           
//         if (data.access_token) { 
//           login(data.access_token) 
//           navigate('/')
//         } else {
//           alert('Invalid username or password')
//         }
//        })

//        reset()
//   }

//   return (
//     <div className='container'>
//       <div className='form'>
//         <form onSubmit={handleSubmit(loginUser)}>
//           <Form.Group>
//             <Form.Label> Username </Form.Label>
//             <Form.Control
//               type="text"
//               placeholder='Your Username'
//               {...register('username', { required: true, maxLength: 25 })}
//             />
//             {errors.username && <p style={{ color: 'red' }}><small>Username is required</small></p>}
//             {errors.username?.type === "maxLength" && <p style={{ color: 'red' }}><small>Username should be 25 characters or less</small></p>}
//           </Form.Group>

//           <Form.Group>
//             <Form.Label> Password </Form.Label>
//             <Form.Control
//               type="password"
//               placeholder='Your Password'
//               {...register('password', { required: true, minLength: 8 })}
//             />
//             {errors.password && <p style={{ color: 'red' }}><small>Password is required</small></p>}
//             {errors.password?.type === "minLength" && <p style={{ color: 'red' }}><small>Password should be at least 8 characters</small></p>}
//           </Form.Group>

//           <br />

//           <Form.Group>
//             <Button as="sub" variant="primary" onClick={() => handleSubmit(loginUser)()}>Log in</Button>
//           </Form.Group>

//           <Form.Group style={{ textAlign: 'center' }}>
//             <small>Do not have an account? <Link to='/signup'>Sign Up</Link></small>
//           </Form.Group>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { login } from "../auth";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  /**
   * !  เพิ่ม localStorage
   * */
  localStorage.setItem("edit_status", false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();

  const loginUser = (data) => {
    const requestOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
    };

    fetch("https://asttestapp.onrender.com/auth/login", requestOptions)
      .then((res) => res.json())
      .then((data) => {
        // console.log(data.access_token);

        if (data.access_token) {
          login(data.access_token);
          navigate("/");
        } else {
          alert("Invalid username or password");
        }
      });

    reset();
  };

  return (
    <div className="container">
      <div className="form">
        <form onSubmit={handleSubmit(loginUser)}>
          <Form.Group>
            <Form.Label> Username </Form.Label>
            <Form.Control
              type="text"
              placeholder="Your Username"
              {...register("username", { required: true, maxLength: 25 })}
            />
            {errors.username && (
              <p style={{ color: "red" }}>
                <small>Username is required</small>
              </p>
            )}
            {errors.username?.type === "maxLength" && (
              <p style={{ color: "red" }}>
                <small>Username should be 25 characters or less</small>
              </p>
            )}
          </Form.Group>

          <Form.Group>
            <Form.Label> Password </Form.Label>
            <Form.Control
              type="password"
              placeholder="Your Password"
              {...register("password", { required: true, minLength: 8 })}
            />
            {errors.password && (
              <p style={{ color: "red" }}>
                <small>Password is required</small>
              </p>
            )}
            {errors.password?.type === "minLength" && (
              <p style={{ color: "red" }}>
                <small>Password should be at least 8 characters</small>
              </p>
            )}
          </Form.Group>

          <br />

          <Form.Group>
            <Button
              as="sub"
              variant="primary"
              onClick={() => handleSubmit(loginUser)()}
            >
              Log in
            </Button>
          </Form.Group>

          <Form.Group style={{ textAlign: "center" }}>
            <small>
              Do not have an account? <Link to="/signup">Sign Up</Link>
            </small>
          </Form.Group>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
