// import React, { createContext, useState, useEffect, useRef } from 'react';
// import { useInputData } from '../components/useInputData';
// import { useNavigate, useLocation } from 'react-router-dom'
// import axios from 'axios';
// import { jwtDecode } from 'jwt-decode';
// import { useImageContext } from '../components/useImageContext';
// import DrawCircle from '../components/draw_circle';
// import '../styles/ResultById.css';

// const ResultPage = () => {
//   const { testId, bacteria, testData = [] } = useInputData();
//   const date = new Date();
//   const location = useLocation();
//   const { image } = useImageContext();

//   const [newDataPoint, setNewDataPoint] = useState('');
//   const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
//   useEffect(() => {
//     const img = new Image();
//     img.src = image;
//     img.onload = () => {
//       setImageSize({ width: img.width, height: img.height });
//     };
//   }, [image]);

//   useEffect(() => {
//     if (location.state?.newDataPoint) {
//       setNewDataPoint(location.state.newDataPoint);
//     }
//   }, [location.state?.newDataPoint]);

//   const day = date.getDate();
//   const monthName = date.toLocaleString('default', { month: 'long' });
//   const year = date.getFullYear();
//   const hours = date.getHours();
//   const minutes = date.getMinutes().toString().padStart(2, '0');
//   const seconds = date.getSeconds().toString().padStart(2, '0');
//   const time = `${hours}:${minutes}:${seconds}`;
//   const formattedDateTime = `${year}-${monthName}-${day} ${time}`;

//   const navigate = useNavigate();

//   const token = localStorage.getItem('REACT_TOKEN_AUTH_KEY');
//   let username = '';
//   if (token) {
//     try {
//       const decoded = jwtDecode(token);
//       username = decoded.sub;
//     } catch (error) {
//       console.error('Error decoding token:', error);
//     }
//   }

//   // const ApiSendData = async () => {
//   //   const formattedTestData = testData.map(data => ({
//   //       antibiotic_name: data[0],   
//   //       resistant: data[1],   
//   //       diameter: data[2]
//   //     }));

//   //   try {
//   //     const response = await axios.post(
//   //       'http://localhost:3000/ASTtest/add_data',
//   //       {
//   //         testId: testId,    
//   //         bacteriaName: bacteria, 
//   //         username,
//   //         newDataPoint: formattedTestData,
//   //         createdAt: formattedDateTime
//   //       },
//   //       {
//   //         headers: {
//   //           'content-type': 'application/json',
//   //         'Authorization': `Bearer ${JSON.parse(token)}`
//   //         }
//   //       }
//   //     );

//   //     console.log("Sending to /add_data:", JSON.stringify({
//   //       testId: testId,
//   //       bacteriaName: bacteria,
//   //       newDataPoint: testData
//   //     }, null, 2));

//   //     if (!testData || !Array.isArray(testData) || testData.length === 0) {
//   //       console.error("Error: testData is empty or invalid", testData);
//   //       return;
//   //     }      

//   //     if (response){
//   //       navigate('/')
//   //     } else {
//   //       console.error('fail to send data');
//   //     }
//   //   } catch (error) {
//   //       console.error('Error Add data:', error.message);
//   //   }
//   // };

//   function dataURLtoFile(dataurl, filename) {
//     const arr = dataurl.split(',');
//     if (arr.length !== 2) {
//       throw new Error("Invalid base64 format");
//     }
  
//     const mimeMatch = arr[0].match(/:(.*?);/);
//     if (!mimeMatch) {
//       throw new Error("Invalid data URL");
//     }
  
//     const mime = mimeMatch[1];
//     const bstr = atob(arr[1]);
//     let n = bstr.length;
//     const u8arr = new Uint8Array(n);
//     while (n--) {
//       u8arr[n] = bstr.charCodeAt(n);
//     }
//     return new File([u8arr], filename, { type: mime });
//   }
  
//   async function blobUrlToFile(blobUrl, filename) {
//     const res = await fetch(blobUrl);
//     const blob = await res.blob();
//     return new File([blob], filename, { type: blob.type });
//   }
  
//   const ApiSendData = async () => {
//     const formattedTestData = testData.map(data => ({
//       antibiotic_name: data[0],
//       resistant: data[1],
//       diameter: data[2]
//     }));
  
//     const filename = `ast_${testId}_${Date.now()}.png`;
  
//     let fileFromBlob;
//     try {
//       fileFromBlob = await blobUrlToFile(image, filename); // ใช้แทน base64
//     } catch (error) {
//       console.error("Failed to convert blob URL to File:", error.message);
//       return;
//     }
  
//     const formData = new FormData();
//     formData.append('image', fileFromBlob);
//     formData.append('data', JSON.stringify({
//       testId,
//       bacteriaName: bacteria,
//       username,
//       newDataPoint: formattedTestData,
//       createdAt: formattedDateTime
//     }));
  
//     try {
//       const response = await axios.post(
//         'http://localhost:3001/ASTtest/add_data',
//         formData,
//         {
//           headers: {
//             'Authorization': `Bearer ${JSON.parse(token)}`
//           }
//         }
//       );
  
//       if (response) {
//         navigate('/');
//       } else {
//         console.error('fail to send data');
//       }
//     } catch (error) {
//       console.error('Error Add data:', error.message);
//     }
//   };
  


//   return (
//     <div className="result-container">
//       <div className="header-section">
//         <p className="result-subtitle">Test result</p>
//       </div>
//       <div className="content-wrapper">
//         <div className="left-section">
//           <div className="box">
//             <div className="box-content">
//               <p className="box-title">Test Information</p>
//               <div className="info-item">
//                 <label className="font-bold">AST ID :&nbsp;</label>
//                 <label>{testId}</label>
//               </div>
//               <div className="info-item">
//                 <label className="font-bold">Created at :&nbsp;</label>
//                 <label>{formattedDateTime}</label>
//               </div>
//               <div className="info-item">
//                 <label className="font-bold">Bacteria :&nbsp;</label>
//                 <label>{bacteria}</label>
//               </div>
//               <div className="info-item">
//                 <label className="font-bold">Last modify by :&nbsp;</label>
//                 <label>{username}</label>
//               </div>
//             </div>
//           </div>

//           <div className="box">
//             <div className="box-content">
//               <p className="box-title">Antibiotics and Diameter</p>
//               {testData && Array.isArray(testData) && testData.length > 0 ? (
//                 testData.map((data, index) => (
//                   <div key={index} className="mb-4 md:mb-2 flex flex-col md:flex-row w-4/5 justify-between">
//                     <label className="font-bold">{data[0]}</label>
//                     <label>
//                       {data[0] !== 'Antimicrobial or Bacteria not found' && <label>{data[1]}</label>}
//                       <label>&nbsp;&nbsp;({data[2]}mm)</label>
//                     </label>
//                   </div>
//                 ))
//               ) : (
//                 <p>No test data available</p>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Right Section: Display Image with Circles */}
//         <div className="right-section">
//           <div className="image-container">
//             <img
//               src={image}
//               alt="Uploaded Image"
//               className="result-image"
//             />
//           </div>
//         </div>

//       </div>
//       <div className="button-container">
//         <button className="button" type="button" onClick={() => navigate('/')}>HOME</button>
//         <button className="button" type="button" onClick={() => ApiSendData()}>SAVE</button>
//       </div>
//     </div>
//   );

// }
// export default ResultPage;



import React, { createContext, useState, useEffect, useRef } from "react";
import { useInputData } from "../components/useInputData";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useImageContext } from "../components/useImageContext";
import DrawCircle from "../components/draw_circle";
import "../styles/ResultById.css";

const ResultPage = () => {
  const { testId, bacteria, testData = [] } = useInputData();
  const date = new Date();
  const location = useLocation();
  const { image } = useImageContext();
  const savedData = JSON.parse(localStorage.getItem("datePx"));

  const [newDataPoint, setNewDataPoint] = useState("");
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const img = new Image();
    img.src = image;
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
    };
  }, [image]);

  useEffect(() => {
    if (location.state?.newDataPoint) {
      setNewDataPoint(location.state.newDataPoint);
    }
  }, [location.state?.newDataPoint]);

  const day = date.getDate();
  const monthName = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const time = `${hours}:${minutes}:${seconds}`;
  const formattedDateTime = `${year}-${monthName}-${day} ${time}`;

  const navigate = useNavigate();

  const token = localStorage.getItem("REACT_TOKEN_AUTH_KEY");
  let username = "";
  if (token) {
    try {
      const decoded = jwtDecode(token);
      username = decoded.sub;
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(",");
    if (arr.length !== 2) {
      throw new Error("Invalid base64 format");
    }

    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
      throw new Error("Invalid data URL");
    }

    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  async function blobUrlToFile(blobUrl, filename) {
    const res = await fetch(blobUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
  }
  /**
   * !  เพิ่ม pixels: savedData[index][1]
   * */
  const ApiSendData = async () => {
    const formattedTestData = testData.map((data, index) => ({
      antibiotic_name: data[0],
      resistant: data[1],
      diameter: data[2],
      pixels: savedData[index][1],
    }));

    const filename = `ast_${testId}_${Date.now()}.png`;

    let fileFromBlob;
    try {
      fileFromBlob = await blobUrlToFile(image, filename); // ใช้แทน base64
    } catch (error) {
      console.error("Failed to convert blob URL to File:", error.message);
      return;
    }

    const formData = new FormData();
    formData.append("image", fileFromBlob);
    formData.append(
      "data",
      JSON.stringify({
        testId,
        bacteriaName: bacteria,
        username,
        newDataPoint: formattedTestData,
        createdAt: formattedDateTime,
      })
    );

    try {
      const response = await axios.post(
        "http://localhost:3001/ASTtest/add_data",
        formData,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(token)}`,
          },
        }
      );

      if (response) {
        navigate("/");
      } else {
        console.error("fail to send data");
      }
    } catch (error) {
      console.error("Error Add data:", error.message);
    }
  };

  console.log("savedData", savedData);

  return (
    <div className="result-container">
      <div className="header-section">
        <p className="result-subtitle">Test result</p>
      </div>
      <div className="content-wrapper">
        <div className="left-section">
          <div className="box">
            <div className="box-content">
              <p className="box-title">Test Information</p>
              <div className="info-item">
                <label className="font-bold">AST ID :&nbsp;</label>
                <label>{testId}</label>
              </div>
              <div className="info-item">
                <label className="font-bold">Created at :&nbsp;</label>
                <label>{formattedDateTime}</label>
              </div>
              <div className="info-item">
                <label className="font-bold">Bacteria :&nbsp;</label>
                <label>{bacteria}</label>
              </div>
              <div className="info-item">
                <label className="font-bold">Last modify by :&nbsp;</label>
                <label>{username}</label>
              </div>
            </div>
          </div>

          <div className="box">
            <div className="box-content">
              <p className="box-title">Antibiotics and Diameter</p>
              {testData && Array.isArray(testData) && testData.length > 0 ? (
                testData.map((data, index) => (
                  <div
                    key={index}
                    className="mb-4 md:mb-2 flex flex-col md:flex-row w-4/5 justify-between"
                  >
                    <label className="font-bold">{data[0]}</label>
                    <label>
                      {data[0] !== "Antimicrobial or Bacteria not found" && (
                        <label>{data[1]}</label>
                      )}
                      <label>&nbsp;&nbsp;({data[2]}mm)</label>
                    </label>
                  </div>
                ))
              ) : (
                <p>No test data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Display Image with Circles */}
        <div className="right-section">
          <div className="image-container">
            <img src={image} alt="Uploaded Image" className="result-image" />
          </div>
        </div>
      </div>
      <div className="button-container">
        <button className="button" type="button" onClick={() => navigate("/")}>
          HOME
        </button>
        <button className="button" type="button" onClick={() => ApiSendData()}>
          SAVE
        </button>
      </div>
    </div>
  );
};
export default ResultPage;
