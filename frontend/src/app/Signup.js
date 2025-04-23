import React, { useState } from 'react'
import { Form, Button, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import "../styles/SignUp.css"
import axios from 'axios';

const SignUpPage = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const submitForm = (data) => {
    if (data.password === data.confirmPassword) {
      const body = {
        username: data.username,
        email: data.email,
        password: data.password
      };

      axios.post('https://asttestapp.onrender.com/auth/signup', body)
        .then(response => {
          if (response.status === 201) {
            alert("Account created successfully");
            setTimeout(() => {
              navigate('/login');
            }, 1000);
          }
        })
        .catch(error => {
          console.error(error);
          if (error.response) {
            if (error.response.status === 409) {
              alert("Username or email already exist");
            } else {
              alert("Please try again.");
            }
          } else {
            alert("Please try again.");
          }
        });

      reset();
    } else {
      alert("password not match");
    }
  };


  return (
    <div className='container'>
      <div className='form'>
        <form>
          <Form.Group>
            <Form.Label> Username </Form.Label>
            <Form.Control type="text"
              placeholder='Username'
              {...register("username", { required: true, maxLength: 25 })}
            />
            {errors.username && <small style={{ color: "red" }}>Username is required</small>}
            {errors.username?.type === "maxLength" && <p style={{ color: "red" }}><small>Max characters should be 25 </small></p>}
          </Form.Group>

          <Form.Group>
            <Form.Label> Email </Form.Label>
            <Form.Control type="text"
              placeholder='Your Email'
              {...register("email", { required: true, maxLength: 80 })}
            />
            {errors.email && <p style={{ color: "red" }}><small>Email is required</small></p>}
            {errors.email?.type === "maxLength" && <p style={{ color: "red" }}><small>Max characters should be 80</small></p>}
          </Form.Group>

          <Form.Group>
            <Form.Label> Password </Form.Label>
            <Form.Control type="password"
              placeholder='Password'
              {...register("password", { required: true, minLength: 8 })}
            />
            {errors.password && <p style={{ color: "red" }}><small>Password is required</small></p>}
            {errors.password?.type === "minLength" && <p style={{ color: "red" }}><small>Min characters should be 8</small></p>}
          </Form.Group>

          <Form.Group>
            <Form.Label> Confirm Password </Form.Label>
            <Form.Control type="password"
              placeholder='Comfirm Password'
              {...register("confirmPassword", { required: true, minLength: 8 })}
            />
            {errors.confirmPassword && <p style={{ color: "red" }}><small>Confirm Password is required</small></p>}
            {errors.confirmPassword?.type === "minLength" && <p style={{ color: "red" }}><small>Min characters should be 8</small></p>}
          </Form.Group>

          <br></br>
          <Form.Group>
            <Button as="sub" variant="primary" onClick={handleSubmit(submitForm)}>SignUp</Button>
          </Form.Group>
        </form>
      </div>
    </div>
  );
}

export default SignUpPage;
