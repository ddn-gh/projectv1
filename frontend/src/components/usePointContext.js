import React, { createContext, useContext, useState, useEffect } from 'react';
const PointContext = createContext();

export const PointProvider = ({ children, pointData, index }) => {
  const [data, setData] = useState(pointData[index]);
  const [newData, setNewData] = useState(pointData);

  console.log("newData",newData)

  useEffect(() => {
    setData(pointData[index]);
  }, [pointData, index]);

  const updateData = (newItem) => {
    setNewData(prevData => {
      const newDataArray = [...prevData];
      if (newDataArray[index] === undefined) {
        newDataArray[index] = []; 
      }
      newDataArray[index] = [...newDataArray[index], newItem]; 
      return newDataArray; 
    });
  };

  const editData = () => {
    setNewData(prevData => {
      const newDataArray = [...prevData];
      if (newDataArray[index]) {
        newDataArray[index].pop(); // ลบตัวสุดท้ายของ array
      }
      return newDataArray;
    });
  };

  return (
    <PointContext.Provider value={{ data, updateData, editData, newData }}>
      {children}
    </PointContext.Provider>
  );
};

export const usePointContext = () => useContext(PointContext);
