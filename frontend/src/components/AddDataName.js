// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { usePointContext } from "./usePointContext";
// import { useImageContext } from "./useImageContext";
// import { useInputData } from "./useInputData";
// import "../styles/AddDataName.css";
// import axios from "axios";

// const AddDataName = ({ onShowNumberInput, currentInde, dataLength }) => {
//   const { data, newData, updateData } = usePointContext();
//   const [antibioticname, setName] = useState("");
//   const { image } = useImageContext();
//   const [images, setImages] = useState("");
//   const { bacteria, username, newDataPoint, setNewDataPoint, setTestData } = useInputData();
//   const navigate = useNavigate();
//   const token = localStorage.getItem("REACT_TOKEN_AUTH_KEY");
//   const [error, setError] = useState("");
//   const [previousAntibiotics, setPreviousAntibiotics] = useState([]);
//   const [previousAntibioticsOld, setPreviousAntibioticsOld] = useState([]);

//   const [isLoading, setIsLoading] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [filteredAntibiotics, setFilteredAntibiotics] = useState([]);
//   const [inputValue, setInputValue] = useState("");

//   const antibioticList = [
//     "AMC: Amoxicillin-clavulanate", "AMK: Amikacin", "AMP: Ampicillin", "AMS: Ampicillin-sulbactam", "ATM: Aztreonam", "AZM: Azithromycin",
//     "CAZ: Ceftazidime", "CAZ-AVI: Ceftazidime-avibactam", "CEC: Cefaclor", "CFDC: Cefiderocol", "CFM: Cefixime", "CFP: Cefoperazone",
//     "CHL: Chloramphenicol", "CID: Cefonicid", "CIN: Cinoxacin", "CIP: Ciprofloxacin", "CLR: Clarithromycin", "CLDM: Clindamycin",
//     "CMZ: Cefmetazole", "COL: Colistin", "CPD: Cefpodoxime", "CPT: Ceftaroline", "CRO: Ceftriaxone", "CTB: Ceftibuten",
//     "CTX: Cefotaxime", "CTT: Cefotetan", "CXM: Cefuroxime", "CXM: Cefuroxime (parenteral)", "CZO: Cefazolin", "CZA: Ceftolozane-avibactam",
//     "CZX: Ceftizoxime", "DAL: Dalbavancin", "DOR: Doripenem", "DOX: Doxycycline", "ENX: Enoxacin", "ERY: Erythromycin",
//     "ETP: Ertapenem", "FEP: Cefepime", "FLX: Fleroxacin", "FOS: Fosfomycin", "FOX: Cefoxitin", "GAT: Gatifloxacin",
//     "GEM: Gemifloxacin", "GEN: Gentamicin", "GPFX: Grepafloxacin", "IMI-REL: Imipenem-relebactam", "IMR: Imipenem-relebactam", "IPM: Imipenem",
//     "KAN: Kanamycin", "LOR: Loracarbef", "LOM: Lomefloxacin", "LVX: Levofloxacin", "LZD: Linezolid", "MAN: Cefamandole",
//     "MEC: Mecillinam", "MEM: Meropenem", "MFX: Moxifloxacin", "MNO: Minocycline", "MOX: Moxalactam", "MVB: Meropenem-vaborbactam",
//     "NAL: Nalidixic acid", "NET: Netilmicin", "NIT: Nitrofurantoin", "NOR: Norfloxacin", "OFX: Ofloxacin", "ORI: Oritavancin",
//     "PCN: Penicillin", "PEF: Pefloxacin (surrogate test for ciprofloxacin)", "PIP: Piperacillin", "PLZ: Plazomicin", "PMB: Polymyxin B",
//     "Q/D: Quinupristin-dalfopristin", "RIF: Rifampin", "SPX: Sparfloxacin", "SPT: Spectinomycin", "SSS: Sulfonamides", "STR: Streptomycin",
//     "SXT: Trimethoprim-sulfamethoxazole", "TCY: Tetracycline", "TEC: Teicoplanin", "TLV: Telavancin", "TMP: Trimethoprim", "TOB: Tobramycin",
//     "TVA: Trovafloxacin", "TZD: Tedizolid", "TZP: Piperacillin-tazobactam", "VAN: Vancomycin"
//   ];
//   const testId = localStorage.getItem("testId");

//   const fetchAntibioticHistory = async () => {
//     if (!testId) return;

//     setIsLoading(true);

//     /**
//      * !  เเก้ try เปลี่ยนการดึงค่าเเละ set ใหม่ inhibition
//      * */
//     try {
//       const response = await axios.get(
//         `https://asttestapp.onrender.com/ASTtest/inhibition/${testId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${JSON.parse(token)}`,
//           },
//         }
//       );
//       let antibioticNames = [];

//       if (
//         response.data &&
//         Array.isArray(response.data) &&
//         response.data.length > 0
//       ) {
//         antibioticNames = response.data.map((item) => item.antibiotic_name);
//       }

//       setPreviousAntibiotics(antibioticNames);
//       setPreviousAntibioticsOld(antibioticNames);
//     } catch (error) {
//       console.error("Error fetching antibiotic history:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   /**
//    * !  เเก้ validateAntibioticName
//    * */
//   const validateAntibioticName = () => {
//     if (!Array.isArray(previousAntibioticsOld)) {
//       console.warn("⚠️ previousAntibioticsOld ไม่มีข้อมูลหรือไม่ใช่ array");
//       return false;
//     }
//     const isFound = previousAntibioticsOld.includes(inputValue);
//     return isFound;
//   };

//   const filterAntibiotics = (value) => {
//     setInputValue(value);
//     if (value) {
//       const matches = antibioticList.filter((antibiotic) =>
//         antibiotic.toLowerCase().startsWith(value.toLowerCase())
//       );
//       setFilteredAntibiotics(
//         matches.length > 0 ? matches : ["Antibiotic Name Not Found"]
//       );
//     } else {
//       setFilteredAntibiotics([]); // Hide the dropdown if the input is empty
//     }
//   };

//   // No data for interpretation
//   const handleSelect = (value) => {
//     setName(value);
//     setInputValue(value);
//     setFilteredAntibiotics([]);
//     setError("");
//     localStorage.setItem("namePx", value);
//   };

//   const TestInfoApi = async () => {
//     try {
//       console.log("Original newData:", newData);
//       const response = await axios.post(
//         "https://asttestapp.onrender.com/ASTtest/test_info",
//         {
//           testId: testId,
//           bacteriaName: bacteria,
//           newDataPoint: newData,
//         },
//         {
//           headers: {
//             "content-type": "application/json",
//             Authorization: `Bearer ${JSON.parse(token)}`,
//           },
//         }
//       );

//       console.log("response", response.data);

//       setTestData(response.data);
//     } catch (error) {
//       console.error("Error fetching data:", error.message);
//     }
//   };
//   useEffect(() => {
//     fetchAntibioticHistory();
//     if (dataLength > 0 && dataLength < currentInde) {
//       try {
//         setNewDataPoint(newData);
//       } catch (error) {
//         console.error("Error while setting new data point:", error);
//       }
//       try {
//         TestInfoApi();
//       } catch (error) {
//         console.error("Error while testing info API:", error);
//       }
//       navigate("/result");
//     }
//   }, []);

//   useEffect(() => {
//     if (data && data.length > 0) {
//       setImages(data[3]);
//     }
//   }, [data]);

//   /**
//    * !  เเก้ handleUpdateData() เเยก update  กับ newData
//    * */
//   const handleUpdateData = () => {
//     const edit_status = localStorage.getItem("edit_status");

//     console.log("edit_status", edit_status);

//     if (edit_status == "true") {
//       if (validateAntibioticName() == false) {
//         alert("Please input previous Antibiotic name");
//         return;
//       }
//     }

//     updateData(antibioticname || inputValue);
//     onShowNumberInput();
//   };
//   const eventUpdateData = (e) => {
//     e.preventDefault();
//     handleUpdateData();
//   };

//   console.log("isEditMode", isEditMode);

//   return (
//     <form
//       className="flex flex-col items-center w-full"
//       onSubmit={eventUpdateData}
//     >
//       <div className="main-container flex items-center justify-start gap-8 mb-8">
//         <div className="image-container">
//           <img
//             width={500}
//             height={500}
//             src={`data:image/png;base64,${images}`}
//             alt="Uploaded Image"
//             className="image"
//           />
//         </div>

//         <div className="content-container">
//           <div className="card-header">
//             {/* <p>{currentInde} of {dataLength}</p> */}
//             <p>Select Antibiotic name </p>
//           </div>
//           <div className="card-body">
//             <input
//               type="text"
//               value={inputValue}
//               onChange={(e) => filterAntibiotics(e.target.value)}
//               placeholder="Search an Antibiotic"
//               className="search-input"
//               required
//             />

//             {filteredAntibiotics.length > 0 && (
//               <ul className="dropdown-list">
//                 {filteredAntibiotics.map((antibiotic, index) => (
//                   <li
//                     key={index}
//                     onClick={() => handleSelect(antibiotic)}
//                     className={
//                       antibiotic === "Antibiotic Name Not Found"
//                         ? "not-found"
//                         : ""
//                     }
//                   >
//                     {antibiotic}
//                   </li>
//                 ))}
//               </ul>
//             )}

//             {error && (
//               <div className="error-message mt-2 text-red-500 font-bold bg-white p-2 rounded">
//                 {error}
//               </div>
//             )}

//             {isLoading && (
//               <div className="loading-indicator mt-2 text-white">
//                 Loading antibiotic history...
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="button-container flex justify-center w-full mt-8">
//         <button className="button" type="submit">
//           NEXT
//         </button>
//       </div>
//     </form>
//   );
// };
// export default AddDataName;







// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { usePointContext } from './usePointContext';
// import { useImageContext } from './useImageContext';
// import { useInputData } from './useInputData';
// import '../styles/AddDataName.css';
// import axios from 'axios';

// const AddDataName = ({ onShowNumberInput, currentInde, dataLength }) => {
//   const { data, newData, updateData } = usePointContext();
//   const [antibioticname, setName] = useState("");
//   const { image } = useImageContext();
//   const [images, setImages] = useState("");
//   const { testId, bacteria, username, newDataPoint, setNewDataPoint, setTestData } = useInputData();
//   const token = localStorage.getItem("REACT_TOKEN_AUTH_KEY");
//   const navigate = useNavigate();
//   const [error, setError] = useState("");
//   const [previousAntibiotics, setPreviousAntibiotics] = useState([]);
//   const [previousAntibioticsOld, setPreviousAntibioticsOld] = useState([]);
  
//   const [isLoading, setIsLoading] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [filteredAntibiotics, setFilteredAntibiotics] = useState([]);
//   const [inputValue, setInputValue] = useState("");

//     const antibioticList = [
//       "AMC: Amoxicillin-clavulanate", "AMK: Amikacin", "AMP: Ampicillin", "AMS: Ampicillin-sulbactam", "ATM: Aztreonam", "AZM: Azithromycin",
//       "CAZ: Ceftazidime", "CAZ-AVI: Ceftazidime-avibactam", "CEC: Cefaclor", "CFDC: Cefiderocol", "CFM: Cefixime", "CFP: Cefoperazone",
//       "CHL: Chloramphenicol", "CID: Cefonicid", "CIN: Cinoxacin", "CIP: Ciprofloxacin", "CLR: Clarithromycin", "CLDM: Clindamycin",
//       "CMZ: Cefmetazole", "COL: Colistin", "CPD: Cefpodoxime", "CPT: Ceftaroline", "CRO: Ceftriaxone", "CTB: Ceftibuten",
//       "CTX: Cefotaxime", "CTT: Cefotetan", "CXM: Cefuroxime", "CXM: Cefuroxime (parenteral)", "CZO: Cefazolin", "CZA: Ceftolozane-avibactam",
//       "CZX: Ceftizoxime", "DAL: Dalbavancin", "DOR: Doripenem", "DOX: Doxycycline", "ENX: Enoxacin", "ERY: Erythromycin",
//       "ETP: Ertapenem", "FEP: Cefepime", "FLX: Fleroxacin", "FOS: Fosfomycin", "FOX: Cefoxitin", "GAT: Gatifloxacin",
//       "GEM: Gemifloxacin", "GEN: Gentamicin", "GPFX: Grepafloxacin", "IMI-REL: Imipenem-relebactam", "IMR: Imipenem-relebactam", "IPM: Imipenem",
//       "KAN: Kanamycin", "LOR: Loracarbef", "LOM: Lomefloxacin", "LVX: Levofloxacin", "LZD: Linezolid", "MAN: Cefamandole",
//       "MEC: Mecillinam", "MEM: Meropenem", "MFX: Moxifloxacin", "MNO: Minocycline", "MOX: Moxalactam", "MVB: Meropenem-vaborbactam",
//       "NAL: Nalidixic acid", "NET: Netilmicin", "NIT: Nitrofurantoin", "NOR: Norfloxacin", "OFX: Ofloxacin", "ORI: Oritavancin",
//       "PCN: Penicillin", "PEF: Pefloxacin (surrogate test for ciprofloxacin)", "PIP: Piperacillin", "PLZ: Plazomicin", "PMB: Polymyxin B", "PRL: Piperacillin",
//       "Q/D: Quinupristin-dalfopristin", "RIF: Rifampin", "SPX: Sparfloxacin", "SPT: Spectinomycin", "SSS: Sulfonamides", "STR: Streptomycin",
//       "SXT: Trimethoprim-sulfamethoxazole","TGC: Tigecycline", "TCY: Tetracycline", "TEC: Teicoplanin", "TLV: Telavancin", "TMP: Trimethoprim", "TOB: Tobramycin",
//       "TVA: Trovafloxacin", "TZD: Tedizolid", "TZP: Piperacillin-tazobactam", "VAN: Vancomycin"
//     ];

//     //const testId = localStorage.getItem("testId");

//   const fetchAntibioticHistory = async () => {
//     if (!testId || !token) return;
    
//     setIsLoading(true);
//     /**
//      * !  เเก้ try เปลี่ยนการดึงค่าเเละ set ใหม่ inhibition
//      * */
//     try {
//       const response = await axios.get(
//         `https://asttestapp.onrender.com/ASTtest/inhibition/${testId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${JSON.parse(token)}`,
//           },
//         }
//       );
//       let antibioticNames = [];

//       if (
//         response.data &&
//         Array.isArray(response.data) &&
//         response.data.length > 0
//       ) {
//         antibioticNames = response.data.map((item) => item.antibiotic_name);
//       }

//       setPreviousAntibiotics(antibioticNames);
//       setPreviousAntibioticsOld(antibioticNames);
//     } catch (error) {
//       console.error("Error fetching antibiotic history:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   /**
//    * !  เเก้ validateAntibioticName
//    * */
//   const validateAntibioticName = () => {
//     if (!Array.isArray(previousAntibioticsOld)) {
//       console.warn("No previous data");
//       return false;
//     }
//     const isFound = previousAntibioticsOld.includes(inputValue);
//     return isFound;
//   };
//   const filterAntibiotics = (value) => {
//     setInputValue(value);
//     if (value) {
//       const matches = antibioticList.filter((antibiotic) =>
//         antibiotic.toLowerCase().startsWith(value.toLowerCase())
//       );
//       setFilteredAntibiotics(
//         matches.length > 0 ? matches : ["Antibiotic Name Not Found"]
//       );
//     } else {
//       setFilteredAntibiotics([]); // Hide the dropdown if the input is empty
//     }
//   };

//   const handleSelect = (value) => {
//     setName(value);
//     setInputValue(value); 
//     setFilteredAntibiotics([]); 
//     setError("");
//     localStorage.setItem("namePx", value);
//   };

//   // Fixed
//   const TestInfoApi = async () => {
//     if (!testId || !bacteria || !token || !newData) {
//       console.error("Missing required data for API call", { testId, bacteria, token, newData });
//       return;
//     }
    
//     let formattedData = [];
    
//     try { 
//       if (Array.isArray(newData)) {
//         console.log("Original newData : ", newData);
    
//         formattedData = newData.map(item => {
//           if (Array.isArray(item) && item.length >= 2) {
//             return [
//               item[0], // antibiotic_name
//               parseFloat(item[1]).toFixed(2), // diameter 
//               item[2] !== undefined ? parseFloat(item[2]) : 0, // x_position
//               item[3] !== undefined ? parseFloat(item[3]) : 0  // y_position
//             ];
//           }
//           return null;
//         }).filter(item => item !== null);
//       }
      
//       console.log("Formatted data : ", formattedData);
      
//       if (formattedData.length === 0) {
//         console.error("No valid data to send to API");
//         return;
//       }
      
//       const response = await axios.post('https://asttestapp.onrender.com/ASTtest/test_info', {
//         testId: testId,
//         bacteriaName: bacteria,
//         newDataPoint: formattedData
//       }, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${JSON.parse(token)}`
//         }
//       });

//       console.log("API response received:", response.data);
      
//       if (response.data && Array.isArray(response.data)) {
//         const enrichedData = response.data.map((apiItem, index) => {
//           const originalItem = formattedData[index] || [];
//           const x = originalItem[2] || 0; 
//           const y = originalItem[3] || 0;
        
//           return [
//             apiItem[0] || "Unknown Antibiotic",
//             apiItem[1] || " : ",
//             apiItem[2] || 0, // diameter in mm
//             x,
//             y
//           ];
//         });
        
//         console.log("Final Data Point for ResultPage : ", enrichedData);
//         setTestData(enrichedData);
        
//         navigate('/result', { 
//           state: { 
//             testData: enrichedData, 
//             rawResponse: response.data,
//             originalData: formattedData
//           } 
//         });
//       } else {
//         console.error("Invalid API response format:", response.data);
//         const fallbackData = formattedData.map(item => [
//           item[0],         // antibiotic name
//           "Unknown",       // Sir
//           parseFloat(item[1]).toFixed(2), // diameter
//           item[2] || 0,    // x position
//           item[3] || 0     // y position
//         ]);
        
//         setTestData(fallbackData);
//         navigate('/result', { state: { testData: fallbackData, originalData: formattedData } });
//       }
//     } catch (error) {
//       console.error('Error in TestInfoApi:', error.message || error);
//       setError(`API Error: ${error.message || 'Unknown error'}`);
//       try {
//         const emergencyData = formattedData.map(item => [
//           item[0],         // antibiotic name
//           "Error",         // Sir
//           parseFloat(item[1]).toFixed(2), // diameter
//           item[2] || 0,    // x 
//           item[3] || 0     // y 
//         ]);
        
//         setTestData(emergencyData);
//         navigate('/result', { state: { testData: emergencyData, originalData: formattedData } });
//       } catch (navError) {
//         console.error("Failed to navigate : ", navError);
//       }
//     }
//   };
//   console.log("isEditMode", isEditMode);


//   useEffect(() => {
//     if (token) {
//       fetchAntibioticHistory();
//       if (dataLength > 0 && dataLength < currentInde) {
//         try {
//           setNewDataPoint(newData);
//           TestInfoApi();
//         } catch (error) {
//           console.error("Error processing data : ", error);
//           setError("Failed to process test data");
//         }
//       }
//     }
//   }, [token, dataLength, currentInde, newData]);

//   useEffect(() => {
//     // if (data && data.length > 0 && data[3]) {
//     if (data && data.length > 0) {
//       setImages(data[3]);
//     }
//   }, [data]);

//   /**
//    * !  เเก้ handleUpdateData() เเยก update  กับ newData
//    * */
//   const handleUpdateData = () => {
//     const edit_status = localStorage.getItem("edit_status");

//     console.log("edit_status", edit_status);

//     if (edit_status == "true") {
//       if (validateAntibioticName() == false) {
//         alert("Please input previous Antibiotic name");
//         console.log("Previous antibiotics:", previousAntibioticsOld);
//         console.log("Current inputValue:", inputValue);
//         console.log("Fetching antibiotics for testId:", testId);

//         return;
//       }
//     }

//     updateData(antibioticname || inputValue);
//     onShowNumberInput();
//   };
//   const eventUpdateData = (e) => {
//     e.preventDefault();
//     handleUpdateData();
//   };

//   return (
//     <form className="flex flex-col items-center w-full" onSubmit={eventUpdateData}>
//       <div className="main-container flex items-center justify-start gap-8 mb-8">
//         {/* Image display section */}
//         <div className="image-container">
//           {images ? (
//             <img
//               width={500}
//               height={500}
//               src={`data:image/png;base64,${images}`}
//               alt="Uploaded Image"
//               className="image"
//             />
//           ) : (
//             <div className="placeholder-image w-500 h-500 flex items-center justify-center bg-gray-200 text-gray-500">
//               No image available
//             </div>
//           )}
//         </div>

//         {/* Data input section */}
//         <div className="content-container">
//           <div className="card-header">
//             <p>Select Antibiotic name</p>
//             {currentInde && dataLength && (
//               <p className="text-sm text-gray-500">{currentInde} of {dataLength}</p>
//             )}
//           </div>
//           <div className="card-body">
//             <input
//               type="text"
//               value={inputValue}
//               onChange={(e) => filterAntibiotics(e.target.value)}
//               placeholder="Search an Antibiotic"
//               className="search-input"
//               required
//             />

//             {filteredAntibiotics.length > 0 && (
//               <ul className="dropdown-list">
//                 {filteredAntibiotics.map((antibiotic, index) => (
//                   <li
//                     key={index}
//                     onClick={() => handleSelect(antibiotic)}
//                     className={
//                       antibiotic === "Antibiotic Name Not Found"
//                         ? "not-found"
//                         : ""
//                     }
//                   >
//                     {antibiotic}
//                   </li>
//                 ))}
//               </ul>
//             )}

//             {error && (
//               <div className="error-message mt-2 text-red-500 font-bold bg-white p-2 rounded">
//                 {error}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="button-container flex justify-center w-full mt-8">
//         <button
//           className="button"
//           type="submit"
//           disabled={isLoading}
//         >
//           {isLoading ? "LOADING..." : "NEXT"}
//         </button>
//       </div>
//     </form>
//   );
// };
// export default AddDataName;







import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePointContext } from './usePointContext';
import { useInputData } from './useInputData';
import '../styles/AddDataName.css';
import axios from 'axios';

const AddDataName = ({ onShowNumberInput, currentInde, dataLength }) => {
  const { data, newData, updateData } = usePointContext();
  const [antibioticname, setName] = useState("");
  const [images, setImages] = useState("");
  const { testId, bacteria, setNewDataPoint, setTestData } = useInputData();
  const token = localStorage.getItem("REACT_TOKEN_AUTH_KEY");
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [previousAntibiotics, setPreviousAntibiotics] = useState([]);
  const [previousAntibioticsOld, setPreviousAntibioticsOld] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filteredAntibiotics, setFilteredAntibiotics] = useState([]);
  const [inputValue, setInputValue] = useState("");

    const antibioticList = [
      "AMC: Amoxicillin-clavulanate", "AMK: Amikacin", "AMP: Ampicillin", "AMS: Ampicillin-sulbactam", "ATM: Aztreonam", "AZM: Azithromycin",
      "CAZ: Ceftazidime", "CAZ-AVI: Ceftazidime-avibactam", "CEC: Cefaclor", "CFDC: Cefiderocol", "CFM: Cefixime", "CFP: Cefoperazone",
      "CHL: Chloramphenicol", "CID: Cefonicid", "CIN: Cinoxacin", "CIP: Ciprofloxacin", "CLR: Clarithromycin", "CLDM: Clindamycin",
      "CMZ: Cefmetazole", "COL: Colistin", "CPD: Cefpodoxime", "CPT: Ceftaroline", "CRO: Ceftriaxone", "CTB: Ceftibuten",
      "CTX: Cefotaxime", "CTT: Cefotetan", "CXM: Cefuroxime", "CXM: Cefuroxime (parenteral)", "CZO: Cefazolin", "CZA: Ceftolozane-avibactam",
      "CZX: Ceftizoxime", "DAL: Dalbavancin", "DOR: Doripenem", "DOX: Doxycycline", "ENX: Enoxacin", "ERY: Erythromycin",
      "ETP: Ertapenem", "FEP: Cefepime", "FLX: Fleroxacin", "FOS: Fosfomycin", "FOX: Cefoxitin", "GAT: Gatifloxacin",
      "GEM: Gemifloxacin", "GEN: Gentamicin", "GPFX: Grepafloxacin", "IMI-REL: Imipenem-relebactam", "IMR: Imipenem-relebactam", "IPM: Imipenem",
      "KAN: Kanamycin", "LOR: Loracarbef", "LOM: Lomefloxacin", "LVX: Levofloxacin", "LZD: Linezolid", "MAN: Cefamandole",
      "MEC: Mecillinam", "MEM: Meropenem", "MFX: Moxifloxacin", "MNO: Minocycline", "MOX: Moxalactam", "MVB: Meropenem-vaborbactam",
      "NAL: Nalidixic acid", "NET: Netilmicin", "NIT: Nitrofurantoin", "NOR: Norfloxacin", "OFX: Ofloxacin", "ORI: Oritavancin",
      "PCN: Penicillin", "PEF: Pefloxacin (surrogate test for ciprofloxacin)", "PIP: Piperacillin", "PLZ: Plazomicin", "PMB: Polymyxin B", "PRL: Piperacillin",
      "Q/D: Quinupristin-dalfopristin", "RIF: Rifampin", "SPX: Sparfloxacin", "SPT: Spectinomycin", "SSS: Sulfonamides", "STR: Streptomycin",
      "SXT: Trimethoprim-sulfamethoxazole","TGC: Tigecycline", "TCY: Tetracycline", "TEC: Teicoplanin", "TLV: Telavancin", "TMP: Trimethoprim", "TOB: Tobramycin",
      "TVA: Trovafloxacin", "TZD: Tedizolid", "TZP: Piperacillin-tazobactam", "VAN: Vancomycin"
    ];

    //const testId = localStorage.getItem("testId");

  const fetchAntibioticHistory = async () => {
    if (!testId || !token) return;
    
    setIsLoading(true);
    /**
     * !  เเก้ try เปลี่ยนการดึงค่าเเละ set ใหม่ inhibition
     * */
    try {
      const response = await axios.get(
        `https://testdeploy1-aqoq.onrender.com/ASTtest/inhibition/${testId}`,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(token)}`,
          },
        }
      );
      let antibioticNames = [];

      if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        antibioticNames = response.data.map((item) => item.antibiotic_name);
      }

      setPreviousAntibiotics(antibioticNames);
      setPreviousAntibioticsOld(antibioticNames);
    } catch (error) {
      console.error("Error fetching antibiotic history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * !  เเก้ validateAntibioticName
   * */
  const validateAntibioticName = () => {
    if (!Array.isArray(previousAntibioticsOld)) {
      console.warn("No previous data");
      return false;
    }
    const isFound = previousAntibioticsOld.includes(inputValue);
    return isFound;
  };
  const filterAntibiotics = (value) => {
    setInputValue(value);
    if (value) {
      const matches = antibioticList.filter((antibiotic) =>
        antibiotic.toLowerCase().startsWith(value.toLowerCase())
      );
      setFilteredAntibiotics(
        matches.length > 0 ? matches : ["Antibiotic Name Not Found"]
      );
    } else {
      setFilteredAntibiotics([]); // Hide the dropdown if the input is empty
    }
  };

  const handleSelect = (value) => {
    setName(value);
    setInputValue(value); 
    setFilteredAntibiotics([]); 
    setError("");
    localStorage.setItem("namePx", value);
  };

  // Fixed
  const TestInfoApi = async () => {
    if (!testId || !bacteria || !token || !newData) {
      console.error("Missing required data for API call", { testId, bacteria, token, newData });
      return;
    }
    
    let formattedData = [];
    
    try { 
      if (Array.isArray(newData)) {
        console.log("Original newData : ", newData);
    
        formattedData = newData.map(item => {
          if (Array.isArray(item) && item.length >= 2) {
            return [
              item[0], // antibiotic_name
              parseFloat(item[1]).toFixed(2), // diameter 
              item[2] !== undefined ? parseFloat(item[2]) : 0, // x_position
              item[3] !== undefined ? parseFloat(item[3]) : 0  // y_position
            ];
          }
          return null;
        }).filter(item => item !== null);
      }
      
      console.log("Formatted data : ", formattedData);
      
      if (formattedData.length === 0) {
        console.error("No valid data to send to API");
        return;
      }
      
      const response = await axios.post('https://asttestapp.onrender.com/ASTtest/test_info', {
        testId: testId,
        bacteriaName: bacteria,
        newDataPoint: formattedData
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(token)}`
        }
      });

      console.log("API response received:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        const enrichedData = response.data.map((apiItem, index) => {
          const originalItem = formattedData[index] || [];
          const x = originalItem[2] || 0; 
          const y = originalItem[3] || 0;
        
          return [
            apiItem[0] || "Unknown Antibiotic",
            apiItem[1] || " : ",
            apiItem[2] || 0, // diameter in mm
            x,
            y
          ];
        });
        
        console.log("Final Data Point for ResultPage : ", enrichedData);
        setTestData(enrichedData);
        
        navigate('/result', { 
          state: { 
            testData: enrichedData, 
            rawResponse: response.data,
            originalData: formattedData
          } 
        });
      } else {
        console.error("Invalid API response format:", response.data);
        const fallbackData = formattedData.map(item => [
          item[0],         // antibiotic name
          "Unknown",       // Sir
          parseFloat(item[1]).toFixed(2), // diameter
          item[2] || 0,    // x position
          item[3] || 0     // y position
        ]);
        
        setTestData(fallbackData);
        navigate('/result', { state: { testData: fallbackData, originalData: formattedData } });
      }
    } catch (error) {
      console.error('Error in TestInfoApi:', error.message || error);
      setError(`API Error: ${error.message || 'Unknown error'}`);
      try {
        const emergencyData = formattedData.map(item => [
          item[0],         // antibiotic name
          "Error",         // Sir
          parseFloat(item[1]).toFixed(2), // diameter
          item[2] || 0,    // x 
          item[3] || 0     // y 
        ]);
        
        setTestData(emergencyData);
        navigate('/result', { state: { testData: emergencyData, originalData: formattedData } });
      } catch (navError) {
        console.error("Failed to navigate : ", navError);
      }
    }
  };
  console.log("isEditMode", isEditMode);


  useEffect(() => {
    if (token) {
      fetchAntibioticHistory();
      if (dataLength > 0 && dataLength < currentInde) {
        try {
          setNewDataPoint(newData);
          TestInfoApi();
        } catch (error) {
          console.error("Error processing data : ", error);
          setError("Failed to process test data");
        }
      }
    }
  }, [token, dataLength, currentInde, newData, setNewDataPoint]);

  useEffect(() => {
    // if (data && data.length > 0 && data[3]) {
    if (data && data.length > 0) {
      setImages(data[3]);
    }
  }, [data]);

  /**
   * !  เเก้ handleUpdateData() เเยก update  กับ newData
   * */
  const handleUpdateData = () => {
    const edit_status = localStorage.getItem("edit_status");

    console.log("edit_status", edit_status);

    if (edit_status === "true") {
      if (validateAntibioticName() === false) {
        alert("Please input previous Antibiotic name");
        console.log("Previous antibiotics:", previousAntibioticsOld);
        console.log("Current inputValue:", inputValue);
        console.log("Fetching antibiotics for testId:", testId);

        return;
      }
    }

    updateData(antibioticname || inputValue);
    onShowNumberInput();
  };
  const eventUpdateData = (e) => {
    e.preventDefault();
    handleUpdateData();
  };

  return (
    <form className="flex flex-col items-center w-full" onSubmit={eventUpdateData}>
      <div className="main-container flex items-center justify-start gap-8 mb-8">
        {/* Image display section */}
        <div className="image-container">
          {images ? (
            <img
              width={500}
              height={500}
              src={`data:image/png;base64,${images}`}
              alt="AST test"
              className="image"
            />
          ) : (
            <div className="placeholder-image w-500 h-500 flex items-center justify-center bg-gray-200 text-gray-500">
              No image available
            </div>
          )}
        </div>

        {/* Data input section */}
        <div className="content-container">
          <div className="card-header">
            <p>Select Antibiotic name</p>
            {currentInde && dataLength && (
              <p className="text-sm text-gray-500">{currentInde} of {dataLength}</p>
            )}
          </div>
          <div className="card-body">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => filterAntibiotics(e.target.value)}
              placeholder="Search an Antibiotic"
              className="search-input"
              required
            />

            {filteredAntibiotics.length > 0 && (
              <ul className="dropdown-list">
                {filteredAntibiotics.map((antibiotic, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelect(antibiotic)}
                    className={
                      antibiotic === "Antibiotic Name Not Found"
                        ? "not-found"
                        : ""
                    }
                  >
                    {antibiotic}
                  </li>
                ))}
              </ul>
            )}

            {error && (
              <div className="error-message mt-2 text-red-500 font-bold bg-white p-2 rounded">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="button-container flex justify-center w-full mt-8">
        <button
          className="button"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "LOADING..." : "NEXT"}
        </button>
      </div>
    </form>
  );
};
export default AddDataName;