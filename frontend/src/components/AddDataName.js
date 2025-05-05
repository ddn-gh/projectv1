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
//       "AMC: Amoxicillin-clavulanate", "AK: Amikacin", "AMP: Ampicillin", "AMS: Ampicillin-sulbactam", "ATM: Aztreonam", "AZM: Azithromycin",
//       "CAZ: Ceftazidime", "CAZ-AVI: Ceftazidime-avibactam", "CEC: Cefaclor", "CFDC: Cefiderocol", "CFM: Cefixime", "CFP: Cefoperazone",
//       "CHL: Chloramphenicol", "CID: Cefonicid", "CIN: Cinoxacin", "CIP: Ciprofloxacin", "CLR: Clarithromycin", "CLDM: Clindamycin",
//       "CMZ: Cefmetazole", "COL: Colistin", "CPD: Cefpodoxime", "CPT: Ceftaroline", "CRO: Ceftriaxone", "CTB: Ceftibuten",
//       "CTX: Cefotaxime", "CTT: Cefotetan", "CXM: Cefuroxime", "CXM: Cefuroxime (parenteral)", "CZO: Cefazolin", "CZA: Ceftolozane-avibactam",
//       "CZX: Ceftizoxime", "DAL: Dalbavancin", "DOR: Doripenem", "DOX: Doxycycline", "ENX: Enoxacin", "ERY: Erythromycin",
//       "ETP: Ertapenem", "FEP: Cefepime", "FLX: Fleroxacin", "FOS: Fosfomycin", "FOX: Cefoxitin", "GAT: Gatifloxacin",
//       "GEM: Gemifloxacin", "GEN: Gentamicin", "GPFX: Grepafloxacin", "IMR: Imipenem-relebactam", "IPM: Imipenem",
//       "KAN: Kanamycin", "LOR: Loracarbef", "LOM: Lomefloxacin", "LVX: Levofloxacin", "LZD: Linezolid", "MAN: Cefamandole",
//       "MEC: Mecillinam", "MEM: Meropenem", "MFX: Moxifloxacin", "MNO: Minocycline", "MOX: Moxalactam", "MVB: Meropenem-vaborbactam",
//       "NAL: Nalidixic acid", "NET: Netilmicin", "NIT: Nitrofurantoin", "NOR: Norfloxacin", "OFX: Ofloxacin", "ORI: Oritavancin",
//       "PEN: Penicillin", "PEF: Pefloxacin (surrogate test for ciprofloxacin)", "PIP: Piperacillin", "PLZ: Plazomicin", "PMB: Polymyxin B", "PRL: Piperacillin",
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
      "AMC: Amoxicillin-clavulanate", "AK: Amikacin", "AMP: Ampicillin", "AMS: Ampicillin-sulbactam", "ATM: Aztreonam", "AZM: Azithromycin",
      "CAZ: Ceftazidime", "CAZ-AVI: Ceftazidime-avibactam", "CEC: Cefaclor", "CFE: Cefixime", "CFP: Cefoperazone",
      "CHL: Chloramphenicol", "CID: Cefonicid", "CIN: Cinoxacin", "CIP: Ciprofloxacin", "CLR: Clarithromycin", "CD: Clindamycin",
      "CMZ: Cefmetazole", "COL: Colistin", "CPD: Cefpodoxime", "CPR: Cefprozil", "CPT: Ceftaroline", "CRO: Ceftriaxone", "CTB: Ceftibuten",
      "CTT: Cefotetan", "CTX: Cefotaxime", "CXM: Cefuroxime", "CXM: Cefuroxime (parenteral)", "CZA: Ceftazidime-avibactam", "CFZ: Cefazolin",
      "CZX: Ceftizoxime", "DAL: Dalbavancin", "DOR: Doripenem", "DOX: Doxycycline", "ENX: Enoxacin", "ERY: Erythromycin",
      "ETP: Ertapenem", "FEP: Cefepime", "FDC: Cefiderocol", "F: Nitrofurantoin", "FLX: Fleroxacin", "FOS: Fosfomycin", "FOX: Cefoxitin", 
      "GAT: Gatifloxacin", "GEM: Gemifloxacin", "GEN: Gentamicin", "GPFX: Grepafloxacin", "IMR: Imipenem-relebactam", "IPM: Imipenem", "IMI: Imipenem",
      "KAN: Kanamycin", "LZD: Linezolid", "LOR: Loracarbef", "LOM: Lomefloxacin", "LVX: Levofloxacin", "MAN: Cefamandole",
      "MEC: Mecillinam", "MEM: Meropenem", "MFX: Moxifloxacin", "MNO: Minocycline", "MOX: Moxalactam", "MEV: Meropenem-vaborbactam",
      "NAL: Nalidixic acid", "NET: Netilmicin", "NOR: Norfloxacin", "OFX: Ofloxacin", "ORI: Oritavancin",
      "PEN: Penicillin", "PEF: Pefloxacin", "PIP: Piperacillin", "PLZ: Plazomicin", "PB: Polymyxin B", "PRL: Piperacillin",
      "QDA: Quinupristin-dalfopristin", "RIF: Rifampin", "SPX: Sparfloxacin", "SPT: Spectinomycin", "SN: Sulfonamides", "STR: Streptomycin",
      "SXT: Trimethoprim-sulfamethoxazole","TGC: Tigecycline", "TC: Tetracycline", "TCC: Ticarcillin-clavulanate", "TEC: Teicoplanin", "TLV: Telavancin", 
      "TMP: Trimethoprim", "TOB: Tobramycin", "TVX: Trovafloxacin", "TZD: Tedizolid", "TZP: Piperacillin-tazobactam", "VA: Vancomycin"
    ];
    const antibioticMap = {
      AMC: "Amoxicillin-clavulanate",
      AK: "Amikacin",
      AMP: "Ampicillin",
      AMS: "Ampicillin-sulbactam",
      ATM: "Aztreonam",
      AZM: "Azithromycin",
      CAZ: "Ceftazidime",
      CEC: "Cefaclor",
      FDC: "Cefiderocol",
      CFE: "Cefixime",
      CFP: "Cefoperazone",
      CHL: "Chloramphenicol",
      CID: "Cefonicid",
      CIN: "Cinoxacin",
      CIP: "Ciprofloxacin",
      CLR: "Clarithromycin",
      CD: "Clindamycin",
      CMZ: "Cefmetazole",
      COL: "Colistin",
      CPD: "Cefpodoxime",
      CPR: "Cefprozil",
      CPT: "Ceftaroline",
      CRO: "Ceftriaxone",
      CTB: "Ceftibuten",
      CTX: "Cefotaxime",
      CTT: "Cefotetan",
      CXM: "Cefuroxime",
      CFZ: "Cefazolin",
      CZA: "Ceftazidime-avibactam",
      CZX: "Ceftizoxime",
      DAL: "Dalbavancin",
      DOR: "Doripenem",
      DOX: "Doxycycline",
      ENX: "Enoxacin",
      ERY: "Erythromycin",
      ETP: "Ertapenem",
      FEP: "Cefepime",
      FLX: "Fleroxacin",
      FOS: "Fosfomycin",
      FOX: "Cefoxitin",
      GAT: "Gatifloxacin",
      GEM: "Gemifloxacin",
      GEN: "Gentamicin",
      GPFX: "Grepafloxacin",
      IMR: "Imipenem-relebactam",
      IMI: "Imipenem",   
      IPM: "Imipenem", 
      KAN: "Kanamycin",
      LOR: "Loracarbef",
      LOM: "Lomefloxacin",
      LVX: "Levofloxacin",
      LZD: "Linezolid",
      MAN: "Cefamandole",
      MEC: "Mecillinam",
      MEM: "Meropenem",
      MFX: "Moxifloxacin",
      MNO: "Minocycline",
      MOX: "Moxalactam",
      MEV: "Meropenem-vaborbactam",
      NAL: "Nalidixic acid",
      NET: "Netilmicin",
      F: "Nitrofurantoin",
      NOR: "Norfloxacin",
      OFX: "Ofloxacin",
      ORI: "Oritavancin",
      PEN: "Penicillin",
      PEF: "Pefloxacin",
      PIP: "Piperacillin",
      PLZ: "Plazomicin",
      PB: "Polymyxin B",
      PRL: "Piperacillin",
      QDA: "Quinupristin-dalfopristin",
      RIF: "Rifampin",
      SPX: "Sparfloxacin",
      SPT: "Spectinomycin",
      SN: "Sulfonamides",
      STR: "Streptomycin",
      SXT: "Trimethoprim-sulfamethoxazole",
      TGC: "Tigecycline",
      TC: "Tetracycline",
      TCC : "Ticarcillin-clavulanate",
      TEC: "Teicoplanin",
      TLV: "Telavancin",
      TMP: "Trimethoprim",
      TOB: "Tobramycin",
      TVX: "Trovafloxacin",
      TZD: "Tedizolid",
      TZP: "Piperacillin-tazobactam",
      VA: "Vancomycin"
    };
    const ocrToAntibioticMap = {
      CN: "GEN",
      AMC: "AMC",
      AM: "AM",
      AMP: "AMP",
      AMS: "AMS",
      ATM: "ATM",
      AZM: "AZM",
      CAZ: "CAZ",
      "CAZ-AVI": "CAZ-AVI",
      CEC: "CEC",
      FDC: "FDC",
      CFE: "CFE",
      CFP: "CFP",
      CHL: "CHL",
      CID: "CID",
      CIN: "CIN",
      CIP: "CIP",
      CLR: "CLR",
      CD: "CD",
      CMZ: "CMZ",
      COL: "COL",
      CPD: "CPD",
      CPR: "CPR",
      CPT: "CPT",
      CRO: "CRO",
      CTB: "CTB",
      CTX: "CTX",
      CTT: "CTT",
      CXM: "CXM",
      CFZ: "CFZ",
      CZA: "CZA",
      CZX: "CZX",
      DAL: "DAL",
      DOR: "DOR",
      DOX: "DOX",
      ENX: "ENX",
      ERY: "ERY",
      ETP: "ETP",
      FEP: "FEP",
      FLX: "FLX",
      FOS: "FOS",
      FOX: "FOX",
      GAT: "GAT",
      GEM: "GEM",
      GPFX: "GPFX",
      IMR: "IMR",
      IPM: "IPM",
      IMI: "IMI",
      KAN: "KAN",
      LOR: "LOR",
      LOM: "LOM",
      LEV: "LVX",
      LZD: "LZD",
      MAN: "MAN",
      MEC: "MEC",
      MEM: "MEM",
      MFX: "MFX",
      MNO: "MNO",
      MOX: "MOX",
      MEV: "MEV",
      NAL: "NAL",
      NET: "NET",
      F: "F",
      NOR: "NOR",
      OFX: "OFX",
      ORI: "ORI",
      PEN: "PEN",
      PEF: "PEF",
      PIP: "PIP",
      PLZ: "PLZ",
      PB: "PB",
      PRL: "PRL",
      QDA: "QDA",
      RIF: "RIF",
      SPX: "SPX",
      SPT: "SPT",
      SN: "SN",
      STR: "STR",
      SXT: "SXT",
      TGC: "TGC",
      TC: "TC",
      TCC: "TCC",
      TEC: "TEC",
      TLV: "TLV",
      TMP: "TMP",
      TOB: "TOB",
      TVX: "TVX",
      TZD: "TZD",
      TZP: "TZP",
      VA: "VA"
    };

    //const testId = localStorage.getItem("testId");

  const fetchAntibioticHistory = async () => {
    if (!testId || !token) return;
    
    setIsLoading(true);
    /**
     * !  เเก้ try เปลี่ยนการดึงค่าเเละ set ใหม่ inhibition
     * */
    try {
      const response = await axios.get(
        `https://asttestapp.onrender.com/ASTtest/inhibition/${testId}`,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(token)}`,
          },
        }
      );
      let antibioticNames = [];

      // if (
      //   response.data &&
      //   Array.isArray(response.data) &&
      //   response.data.length > 0
      // ) {
      //   antibioticNames = response.data.map((item) => item.antibiotic_name);
      // }
      /* fix fetch history */
      if (
        response.data &&
        response.data.history &&
        Array.isArray(response.data.history) &&
        response.data.history.length > 0
      ) {
        antibioticNames = response.data.history.map(
          (item) => item.antibiotic_name
        );
      }

      setPreviousAntibiotics(antibioticNames);
      setPreviousAntibioticsOld(antibioticNames);

      // ADD 
      if (antibioticNames.length === 0) {
        localStorage.setItem("edit_status", "false");
      } else {
        localStorage.setItem("edit_status", "true");
      }
      
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


  useEffect(() => {
    const medicineInfo = JSON.parse(localStorage.getItem('medicineInfo') || '[]');
    if (medicineInfo.length > 0 && currentInde != null) {
      let index = Math.max(0, currentInde - 1);
      if (index >= medicineInfo.length) {
        index = medicineInfo.length - 1;
      }

      const ocrAbbrev = medicineInfo[index]?.med_name || "";
      // const trueAbbrev = ocrToAntibioticMap[ocrAbbrev] || ocrAbbrev;
      // const fullName = antibioticMap[trueAbbrev];
      // if (fullName) {
      //   setInputValue(`${trueAbbrev}: ${fullName}`);
      // } else {
      //   setInputValue(`${trueAbbrev}: Unknown`);
      // }
      const fullName = antibioticMap[ocrAbbrev];
      if (fullName) {
        setInputValue(`${ocrAbbrev}: ${fullName}`);
      } else {
        setInputValue(`${ocrAbbrev}: Unknown`);
      }
    } else {
      if (previousAntibiotics.length > 0 && currentInde != null && currentInde < previousAntibiotics.length) {
        setInputValue(previousAntibiotics[currentInde]);
      }
    }
  }, [previousAntibiotics, currentInde]);

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