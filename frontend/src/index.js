import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Routes, Route } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import Navbar from './app/Navbar';
import HomePage from './app/Home';
import SignUpPage from './app/Signup';
import LoginPage from './app/Login';
import ReportPage from './app/ReportPage';
import CreateNewTestPage from './app/CreateNewTest';
import ImportImage from './app/ImportImage';
import AnalyzeImage from './app/Analyze';
import ResultPage from './app/ResultPage';
import ResultById from './app/ResultById';
import EditTestPage from './app/EditTest';

import { ImageProvider } from './components/useImageContext';
import { InputProvider } from './components/useInputData';

import { BrowserRouter as Router } from 'react-router-dom';

const App = () => {
  return (
    <InputProvider> {/* Wrap App with InputProvider */}
      <ImageProvider>
        <Router>
          <div className="container">
            <Navbar />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/createnewtest" element={<CreateNewTestPage />} />
              <Route path="/analyze" element={<AnalyzeImage />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/import" element={<ImportImage />} />
              <Route path="/result" element={<ResultPage />} />
              <Route path="/result/:testId" element={<ResultById />} />
              <Route path="/edit/:test_id" element={<EditTestPage />} />
            </Routes>
          </div>
        </Router>
      </ImageProvider>
    </InputProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />); 
