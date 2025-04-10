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
//   const navigate = useNavigate();
//   const token = localStorage.getItem('REACT_TOKEN_AUTH_KEY');
//   const [error, setError] = useState("");
//   const [previousAntibiotics, setPreviousAntibiotics] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);

//   const antibioticList = [": Penicillin", "AMC: Amoxicillin-clavulanate", "AMK: Amikacin", "AMP: Ampicillin", 
//     "ATM: Aztreonam", "AZM: Azithromycin", "CAT: Cefetamet", "CAZ: Ceftazidime", "CDR: Cefdinir", "CEC: Cefaclor", 
//     "CFM: Cefixime", "CFP: Cefoperazone", "CHL: Chloramphenicol", "CID: Cefonicid", "CIN: Cinoxacin", 
//     "CIP: Ciprofloxacin", "CLR: Clarithromycin", "CMZ: Cefmetazole", "COL: Colistin", "COP/POL: Colistin or polymyxin B", 
//     "CPD: Cefpodoxime", "CPR: Cefprozil", "CPT: Ceftaroline", "CRO: Ceftriaxone", "CTB: Ceftibuten", "CTT: Cefotetan", 
//     "CTX: Cefotaxime", "CXM: Cefuroxime", "CXM: Cefuroxime (parenteral)", "CZA: Ceftazidime-avibactam", "CZO: Cefazolin", 
//     "CZO: Cefazolin (surrogate test for oral cephalosporins and uncomplicated UTIs)", "CZT: Ceftolozane-tazobactam", 
//     "CZX: Ceftizoxime", "DAL: Dalbavancin", "DOR: Doripenem", "DOX: Doxycycline", "ENX: Enoxacin", "ERY: Erythromycin", 
//     "ETP: Ertapenem", "FDC: Cefonicid", "FEP: Cefepime", "FLE: Fleroxacin", "FOS: Fosfomycin", "FOX: Cefoxitin", 
//     "GAT: Gatifloxacin", "GEM: Gemifloxacin", "GEN: Gentamicin", "GRX: Grepafloxacin", "IMR: Imipenem-relebactam", 
//     "IPM: Imipenem", "KAN: Kanamycin", "LNZ: Linezolid", "LOM: Lomefloxacin", "LOR: Loracarbef", "LVX: Levofloxacin", 
//     "MAN: Cefamandole", "MEC: Mecillinam", "MEM: Meropenem", "MEV: Meropenem-vaborbactam", "MFX: Moxifloxacin", 
//     "MNO: Minocycline", "MOX: Moxalactam", "NAL: Nalidixic acid", "NET: Netilmicin", "NIT: Nitrofurantoin", "NOR: Norfloxacin", 
//     "OFX: Ofloxacin", "ORI: Oritavancin", "PEF: Pefloxacin (surrogate test for ciprofloxacin)", "PIP: Piperacillin", 
//     "POL: Polymyxin B", "PRL: Pirlimycin", "QDA: Quinupristin-dalfopristin", "RIF: Rifampin", "SAM: Ampicillin-sulbactam", 
//     "SAMSAM: Ampicillin-sulbactam", "SPX: Sparfloxacin", "SSS: Sulfonamides", "STR: Streptomycin", "SXT: Trimethoprim- sulfamethoxazole", 
//     "SXT: Trimethoprim-sulfamethoxazole", "TCC: Ticarcillin-clavulanate", "TCY: Tetracycline", "TEC: Teicoplanin", 
//     "TGC: Tigecycline", "TLV: Telavancin", "TMP: Trimethoprim", "TOB: Tobramycin", "TVA: Trovafloxacin", "TZD: Tedizolid", 
//     "TZP: Piperacillin-tazobactam", "VAN: Vancomycin"];

//   const [filteredAntibiotics, setFilteredAntibiotics] = useState([]);
//   const [inputValue, setInputValue] = useState("");

//   // Function to fetch previous antibiotics history old
//   const fetchAntibioticHistory = async () => {
//     if (!testId) return;
    
//     setIsLoading(true);
//     try {
//       const response = await axios.get(`http://localhost:3000/ASTtest/inhibition_history/${testId}`, {
//         headers: {
//           'Authorization': `Bearer ${JSON.parse(token)}`,
//         }
//       });
      
//       if (response.data && Array.isArray(response.data)) {
//         // Group antibiotics by their position/index in the test
//         const antibioticsByPosition = {};

//         response.data.forEach(item => {
//           const zoneIndex = item.zone_index || currentInde - 1; // Use current index if no zone_index
          
//           if (!antibioticsByPosition[zoneIndex]) {
//             antibioticsByPosition[zoneIndex] = [];
//           }
//           antibioticsByPosition[zoneIndex].push(item.antibiotic_name);
//         });
        
//         setPreviousAntibiotics(antibioticsByPosition);
//       }
//     } catch (error) {
//       console.error('Error fetching antibiotic history:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Check if the current antibiotic name match previous
//   const validateAntibioticName = () => {
//     const currentIndex = currentInde - 1;
//     const previousAntibioticsForPosition = previousAntibiotics[currentIndex] || [];

//     // no history (first test)
//     if (previousAntibioticsForPosition.length === 0) {
//       return true;
//     }
//     // if the current antibiotic name match any previous names
//     return previousAntibioticsForPosition.includes(inputValue);
//   };

//   const filterAntibiotics = (value) => {
//     setInputValue(value);
//     if (value) {
//       const matches = antibioticList.filter((antibiotic) =>
//         antibiotic.toLowerCase().startsWith(value.toLowerCase())
//       );
//       setFilteredAntibiotics(matches.length > 0 ? matches : ["Antibiotic Name Not Found"]);
//     } else {
//       setFilteredAntibiotics([]); // Hide the dropdown if the input is empty
//     }
//   };
//   const handleSelect = (value) => {
//     setName(value);
//     setInputValue(value); 
//     setFilteredAntibiotics([]); 
//     setError("");
//   };

//   const TestInfoApi = async () => {
//     try {
//       const response = await axios.post('http://localhost:3001/ASTtest/test_info', {
//         testId: testId,
//         bacteriaName: bacteria,
//         newDataPoint: newData
//       },
//       {
//         headers: {
//           'content-type': 'application/json',
//           'Authorization': `Bearer ${JSON.parse(token)}`,
//         }
//       });

//       setTestData(response.data);
//     } catch (error) {
//       console.error('Error fetching data:', error.message);
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
//       navigate('/result');
//     }
//   }, []);

//   useEffect(() => {
//     if (data && data.length > 0) {
//       setImages(data[3]);
//     }
//   }, [data]);
//   const handleUpdateData = () => {
//     if (!validateAntibioticName() && Object.keys(previousAntibiotics).length > 0) {
//       alert("Please input previous Antibiotic name");
//       return;
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
//             <div className="card-header">
//               {/* <p>{currentInde} of {dataLength}</p> */}
//               <p>Select Antibiotic name</p>
//             </div>
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
//                     className={antibiotic === "Antibiotic Name Not Found" ? "not-found" : ""}
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
//         <button
//           className="button"
//           type="submit"
//         >
//           NEXT
//         </button>
//       </div>
//     </form>
//   );
// };

// export default AddDataName;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePointContext } from "./usePointContext";
import { useImageContext } from "./useImageContext";
import { useInputData } from "./useInputData";
import "../styles/AddDataName.css";
import axios from "axios";
import { authFetch, login } from "../auth";

const AddDataName = ({ onShowNumberInput, currentInde, dataLength }) => {
  const { data, newData, updateData } = usePointContext();
  const [antibioticname, setName] = useState("");
  const { image } = useImageContext();
  const [images, setImages] = useState("");
  const { bacteria, username, newDataPoint, setNewDataPoint, setTestData } =
    useInputData();
  const navigate = useNavigate();
  const token = localStorage.getItem("REACT_TOKEN_AUTH_KEY");
  const [error, setError] = useState("");
  const [previousAntibiotics, setPreviousAntibiotics] = useState([]);
  const [previousAntibioticsOld, setPreviousAntibioticsOld] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filteredAntibiotics, setFilteredAntibiotics] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const antibioticList = [": Penicillin", "AMC: Amoxicillin-clavulanate", "AMK: Amikacin", "AMP: Ampicillin", 
        "ATM: Aztreonam", "AZM: Azithromycin", "CAT: Cefetamet", "CAZ: Ceftazidime", "CDR: Cefdinir", "CEC: Cefaclor", 
        "CFM: Cefixime", "CFP: Cefoperazone", "CHL: Chloramphenicol", "CID: Cefonicid", "CIN: Cinoxacin", 
        "CIP: Ciprofloxacin", "CLR: Clarithromycin", "CMZ: Cefmetazole", "COL: Colistin", "COP/POL: Colistin or polymyxin B", 
        "CPD: Cefpodoxime", "CPR: Cefprozil", "CPT: Ceftaroline", "CRO: Ceftriaxone", "CTB: Ceftibuten", "CTT: Cefotetan", 
        "CTX: Cefotaxime", "CXM: Cefuroxime", "CXM: Cefuroxime (parenteral)", "CZA: Ceftazidime-avibactam", "CZO: Cefazolin", 
        "CZO: Cefazolin (surrogate test for oral cephalosporins and uncomplicated UTIs)", "CZT: Ceftolozane-tazobactam", 
        "CZX: Ceftizoxime", "DAL: Dalbavancin", "DOR: Doripenem", "DOX: Doxycycline", "ENX: Enoxacin", "ERY: Erythromycin", 
        "ETP: Ertapenem", "FDC: Cefonicid", "FEP: Cefepime", "FLE: Fleroxacin", "FOS: Fosfomycin", "FOX: Cefoxitin", 
        "GAT: Gatifloxacin", "GEM: Gemifloxacin", "GEN: Gentamicin", "GRX: Grepafloxacin", "IMR: Imipenem-relebactam", 
        "IPM: Imipenem", "KAN: Kanamycin", "LNZ: Linezolid", "LOM: Lomefloxacin", "LOR: Loracarbef", "LVX: Levofloxacin", 
        "MAN: Cefamandole", "MEC: Mecillinam", "MEM: Meropenem", "MEV: Meropenem-vaborbactam", "MFX: Moxifloxacin", 
        "MNO: Minocycline", "MOX: Moxalactam", "NAL: Nalidixic acid", "NET: Netilmicin", "NIT: Nitrofurantoin", "NOR: Norfloxacin", 
        "OFX: Ofloxacin", "ORI: Oritavancin", "PEF: Pefloxacin (surrogate test for ciprofloxacin)", "PIP: Piperacillin", 
        "POL: Polymyxin B", "PRL: Pirlimycin", "QDA: Quinupristin-dalfopristin", "RIF: Rifampin", "SAM: Ampicillin-sulbactam", 
        "SAMSAM: Ampicillin-sulbactam", "SPX: Sparfloxacin", "SSS: Sulfonamides", "STR: Streptomycin", "SXT: Trimethoprim- sulfamethoxazole", 
        "SXT: Trimethoprim-sulfamethoxazole", "TCC: Ticarcillin-clavulanate", "TCY: Tetracycline", "TEC: Teicoplanin", 
        "TGC: Tigecycline", "TLV: Telavancin", "TMP: Trimethoprim", "TOB: Tobramycin", "TVA: Trovafloxacin", "TZD: Tedizolid", 
        "TZP: Piperacillin-tazobactam", "VAN: Vancomycin"];
  const testId = localStorage.getItem("testId");

  // Function to fetch previous antibiotics history old
  const fetchAntibioticHistory = async () => {
    if (!testId) return;

    setIsLoading(true);

    /**
     * !  เเก้ try เปลี่ยนการดึงค่าเเละ set ใหม่ inhibition
     * */
    try {
      const response = await axios.get(
        `http://localhost:3001/ASTtest/inhibition/${testId}`,
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
      console.warn("⚠️ previousAntibioticsOld ไม่มีข้อมูลหรือไม่ใช่ array");
      return false;
    }
    const isFound = previousAntibioticsOld.includes(inputValue);

    return isFound;
    // return isFound;
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

  // No data for interpretation Antibiotic Name Not Found
  // No data for interpretation TGC: Tigecycline
  const handleSelect = (value) => {
    setName(value);
    setInputValue(value);
    setFilteredAntibiotics([]);
    setError("");
    localStorage.setItem("namePx", value); //เพิ่มใหม่
  };

  const TestInfoApi = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3001/ASTtest/test_info",
        {
          testId: testId,
          bacteriaName: bacteria,
          newDataPoint: newData,
        },
        {
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${JSON.parse(token)}`,
          },
        }
      );

      console.log("response", response.data);
      // Check if medLocations is in the response
      if (response.data.medLocations) {
        // Store medicine locations in localStorage for use in ResultPage
        localStorage.setItem("medLocations", JSON.stringify(response.data.medLocations));
      }
      // Set test data from the response
      setTestData(response.data.antibioticData || response.data);
      //setTestData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };


  useEffect(() => {
    fetchAntibioticHistory();
    if (dataLength > 0 && dataLength < currentInde) {
      try {
        setNewDataPoint(newData);
      } catch (error) {
        console.error("Error while setting new data point:", error);
      }
      try {
        TestInfoApi();
      } catch (error) {
        console.error("Error while testing info API:", error);
      }
      navigate("/result");
    }
  }, []);

  useEffect(() => {
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

    if (edit_status == "true") {
      if (validateAntibioticName() == false) {
        alert("Please input previous Antibiotic name");
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

  console.log("isEditMode", isEditMode);

  return (
    <form
      className="flex flex-col items-center w-full"
      onSubmit={eventUpdateData}
    >
      <div className="main-container flex items-center justify-start gap-8 mb-8">
        <div className="image-container">
          <img
            width={500}
            height={500}
            src={`data:image/png;base64,${images}`}
            alt="Uploaded Image"
            className="image"
          />
        </div>

        <div className="content-container">
          <div className="card-header">
            {/* <p>{currentInde} of {dataLength}</p> */}
            <p>Select Antibiotic name </p>
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

            {isLoading && (
              <div className="loading-indicator mt-2 text-white">
                Loading antibiotic history...
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="button-container flex justify-center w-full mt-8">
        <button className="button" type="submit">
          NEXT
        </button>
      </div>
    </form>
  );
};

export default AddDataName;
