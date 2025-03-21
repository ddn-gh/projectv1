import React, { createContext, useContext, useState, useEffect } from 'react';
const InputData = createContext();

export const InputProvider = ({ children }) => {
  const [testId, setTestId] = useState("");
  const [bacteria, setBacteriaName] = useState();
  const [newDataPoint, setNewDataPoint] = useState([]);
  const [testData, setTestData] = useState([]);

  useEffect(() => {
    fetch('/ASTtest/get_data_by_testID')
      .then(response => response.json())
      .catch(err => console.error("Error fetching username", err));
  }, []); 

  return (
    <InputData.Provider value={{ testId, setTestId, bacteria, setBacteriaName, newDataPoint, setNewDataPoint, testData, setTestData }}>
      {children}
    </InputData.Provider>
  );
};

export const useInputData = () => useContext(InputData);