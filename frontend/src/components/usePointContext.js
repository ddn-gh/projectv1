// import React, { createContext, useContext, useState, useEffect } from "react";
// const PointContext = createContext();

// export const PointProvider = ({ children, pointData, index }) => {
//   const [data, setData] = useState(pointData[index]);
//   const [newData, setNewData] = useState(pointData);

//   console.log("newData", newData);

//   useEffect(() => {
//     setData(pointData[index]);
//   }, [pointData, index]);

//   const updateData = (newItem) => {
//     setNewData((prevData) => {
//       const newDataArray = [...prevData];
//       if (newDataArray[index] === undefined) {
//         newDataArray[index] = [];
//       }
//       newDataArray[index] = [...newDataArray[index], newItem];
//       console.log("Updated data array:", newDataArray[index]);
//       return newDataArray;
//     });
//   };

//   const editData = () => {
//     setNewData((prevData) => {
//       const newDataArray = [...prevData];
//       if (newDataArray[index]) {
//         newDataArray[index].pop(); // ลบตัวสุดท้ายของ array
//       }
//       return newDataArray;
//     });
//   };
//   /**
//    * !  เพิ่ม localStorage
//    * */

//   useEffect(() => {
//     localStorage.setItem("datePx", JSON.stringify(newData));
//   }, [newData]);
//   return (
//     <PointContext.Provider value={{ data, updateData, editData, newData }}>
//       {children}
//     </PointContext.Provider>
//   );
// };
// export const usePointContext = () => useContext(PointContext);




import React, { createContext, useContext, useState, useEffect } from 'react';
const PointContext = createContext();

export const PointProvider = ({ children, pointData, index }) => {
  const [data, setData] = useState(pointData[index]);
  const [newData, setNewData] = useState(pointData);

  console.log("newData (Lastest) : ", newData);

  useEffect(() => {
    setData(pointData[index]);
  }, [pointData, index]);

  const updateData = (newItem) => {
    setNewData(prevData => {
      const newDataArray = [...prevData];
      if (newDataArray[index] === undefined) {
        newDataArray[index] = []; 
      }
      
      if (Array.isArray(newItem)) {
        const [diameter, x, y] = newItem;
        
        if (newDataArray[index].length > 0) {
          const antibioticName = newDataArray[index][0];
          newDataArray[index] = [antibioticName, diameter, x, y];
        } else {
          newDataArray[index] = ["Unknown", diameter, x, y];
        }
      } else {
        if (typeof newItem === 'string') {
          // antibiotic name
          if (newDataArray[index].length > 0) {
            const existingCoords = newDataArray[index].slice(1);
            newDataArray[index] = [newItem, ...existingCoords];
          } else {
            newDataArray[index] = [newItem];
          }
        } else {
          // diameter value
          newDataArray[index].push(newItem);
        }
      }
      console.log("New updated data (antibiotic name) : ", newDataArray[index]);
      return newDataArray; 
    });
  };

  const editData = () => {
    setNewData(prevData => {
      const newDataArray = [...prevData];
      if (newDataArray[index]) {
        newDataArray[index].pop(); // Remove last item from array
      }
      return newDataArray;
    });
  };

  /**
  * !  เพิ่ม localStorage
  * */
  useEffect(() => {
    localStorage.setItem("datePx", JSON.stringify(newData));
  }, [newData]);

  return (
    <PointContext.Provider value={{ data, updateData, editData, newData }}>
      {children}
    </PointContext.Provider>
  );
};

export const usePointContext = () => useContext(PointContext);
