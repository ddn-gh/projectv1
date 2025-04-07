// import React, { useState, useEffect } from 'react';
// import Slider from 'rc-slider';
// import 'rc-slider/assets/index.css'; 
// import { usePointContext } from './usePointContext';
// import DrawCircle from "./draw_circle";
// import { useInputData } from './useInputData';
// import '../styles/AddDataNumber.css';
// import axios from 'axios';

// export default function AddDataNumber({ onNext, onBack, currentInde, dataLength }) {
//   const { data, updateData, editData } = usePointContext();
//   const { testId } = useInputData();

//   const [circleRadius, setCircleRadius] = useState(data[2]); 
//   const [loading, setLoading] = useState(false);
//   const [usePreviousPrediction, setUsePreviousPrediction] = useState(false);
//   const [previousRadius, setPreviousRadius] = useState(null);
//   const token = localStorage.getItem('REACT_TOKEN_AUTH_KEY');

//   useEffect(() => {
//     if (testId) {
//       fetchPreviousData();
//     }
//   }, []);
//   const fetchPreviousData = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('REACT_TOKEN_AUTH_KEY');
//       const response = await axios.get(`http://localhost:3001/ASTtest/inhibition_history/${testId}`, {
//         headers: {
//           'Authorization': `Bearer ${JSON.parse(token)}`,
//         }
//       });
      
//       if (response.data && Array.isArray(response.data) && response.data.length > 0) {
//         const previousData = response.data.filter(item => 
//           item.number_of_test === currentInde
//         );
        
//         if (previousData.length > 0) {
//           setPreviousRadius(previousData[0].diameter);
//           setCircleRadius(previousData[0].diameter); // ตั้งค่ารัศมีวงกลมจากการทำนายครั้งก่อน
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching previous data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSliderChange = (value) => {
//     setCircleRadius(value);
//   };
//   const handleUpdateData = () => {
//     updateData(circleRadius);
//     onNext(); 
//   };
//   const handleEditData = () => {
//     editData();
//     onBack(); 
//   };

//   return (
//     <form className="form-container">
//       <div className="wrapper">
//         <div className="left-side">
//           <DrawCircle circleRadius={circleRadius} Xaxis={data[0]} Yaxis={data[1]}/>
//         </div>
  
//         <div className="right-side">
//           <div className="card">
//             <div className="card-header">
//               <p>{currentInde} of {dataLength}</p>
//             </div>
//             <div className="card-body">
//               <div className="slider-wrapper">
//                 <div className="slider-label">
//                   <label>Confirm Inhibition Zone:</label>
//                   <label>{circleRadius}</label>
//                 </div>
//                 <Slider 
//                   min={40}  
//                   max={440} 
//                   step={0.01}
//                   value={circleRadius} 
//                   onChange={handleSliderChange}
//                 />
//                 <div className="checkbox-wrapper">
//                   <div className="checkbox-item">
//                     <input
//                       id="circleRadiusCheckbox"
//                       type="checkbox"
//                       checked={circleRadius === 76}
//                       onChange={(e) => setCircleRadius(e.target.checked ? 76 : 0)}
//                     />
//                     <label htmlFor="circleRadiusCheckbox">
//                       This Pellet Have No Inhibition Zone
//                     </label>
//                   </div>
                  
//                   <div className="checkbox-item">
//                     <input
//                       id="circleRadiusCheckbox2"
//                       type="checkbox"
//                       checked={circleRadius === data[2]}
//                       onChange={(e) => setCircleRadius(e.target.checked ? data[2] : 0)}
//                     />
//                     <label htmlFor="circleRadiusCheckbox2">
//                       Use Prediction
//                     </label>
//                   </div>
  
//                   {loading && (
//                     <div className="loading-indicator">
//                       Loading previous data...
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
  
//       <div className="button-wrapper">
//         <button 
//           className="button"
//           type="button" 
//           onClick={handleEditData}
//         >
//           BACK
//         </button>
//         <button 
//           className="button"
//           type="button" 
//           onClick={() => handleUpdateData(circleRadius)}
//         >
//           NEXT
//         </button>
//       </div>
//     </form>
//   );
// }

import React, { useState, useEffect } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { usePointContext } from "./usePointContext";
import DrawCircle from "./draw_circle";
import { useInputData } from "./useInputData";
import "../styles/AddDataNumber.css";
import axios from "axios";

export default function AddDataNumber({
  onNext,
  onBack,
  currentInde,
  dataLength,
}) {
  const { data, updateData, editData } = usePointContext();
  const { testId } = useInputData();

  const [circleRadius, setCircleRadius] = useState([]);
  const [circleRadiusOld, setCircleRadiusOld] = useState([]);
  const [originalPixel, setOriginalPixel] = useState(null); //เพิ่มใหม่

  const [loading, setLoading] = useState(false);
  const [circlStatus, setCirclStatus] = useState(true);
  /**
   * !  เพิ่ม setCirclStatus
   * */
  const edit_status = localStorage.getItem("edit_status");
  const savedData = JSON.parse(localStorage.getItem("datePx"));
  const savedNamePx = localStorage.getItem("namePx"); //เพิ่มใหม่

  const [usePreviousPrediction, setUsePreviousPrediction] = useState(false);
  const [previousRadius, setPreviousRadius] = useState([]);
  const token = localStorage.getItem("REACT_TOKEN_AUTH_KEY");

  useEffect(() => {
    if (testId) {
      fetchPreviousData();
    }
  }, []);
  /**
   * !  เพิ่ม fetchPreviousData
   * */
  const fetchPreviousData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("REACT_TOKEN_AUTH_KEY");
      const response = await axios.get(
        `http://localhost:3001/ASTtest/inhibition/${testId}`,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(token)}`,
          },
        }
      );

      let diameterOld = [];
      let pixelOld = [];

      if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const sortedData = [...response.data].sort(
          (a, b) => a.zone_id - b.zone_id
        );

        diameterOld = sortedData.map((item) => item.diameter);
        pixelOld = sortedData.map((item) => item); //เพิ่มใหม่ .pixel
      }
      if (edit_status == "true") {
        const match = response.data.find(
          (item) => item.antibiotic_name == savedNamePx
        );
        if (match) {
          //เพิ่มใหม่

          setPreviousRadius(diameterOld);
          setCircleRadius(match.pixel); //เพิ่มใหม่
          setCircleRadiusOld(match.pixel);
          setOriginalPixel(match.pixel); //เพิ่มใหม่
        }
      } else {
        setPreviousRadius(data[2]);
        setCircleRadius(data[2]);
        setCirclStatus(false);
      }
      // ตั้งค่ารัศมีวงกลมจากการทำนายครั้งก่อน
    } catch (error) {
      console.error("Error fetching previous data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (value) => {
    setCirclStatus(false);
    setCircleRadius(value);
  };
  const handleUpdateData = () => {
    updateData(circleRadius);
    onNext();
  };
  const handleEditData = () => {
    editData();
    onBack();
  };

  console.log("data", circleRadius, data[0], data[1]);

  /**
   * !  เเก้ handleUpdateData() เเยก update  กับ newData
   * */
  // 6.960000038146973;

  return (
    <form className="form-container">
      <div className="wrapper">
        <div className="left-side">
          <DrawCircle
            circleRadius={circleRadius}
            Xaxis={data[0]}
            Yaxis={data[1]}
          />
        </div>

        <div className="right-side">
          <div className="card">
            <div className="card-header">
              <p>
                {currentInde} of {dataLength}
              </p>
            </div>
            <div className="card-body">
              <div className="slider-wrapper">
                <div className="slider-label">
                  <label>Confirm Inhibition Zone:</label>
                  <label>{circleRadius}</label>
                </div>
                <Slider
                  min={40}
                  max={440}
                  step={0.01}
                  value={circleRadius}
                  onChange={handleSliderChange}
                />
                <div className="checkbox-wrapper">
                  <div className="checkbox-item">
                    <input
                      className="checkbox-left"
                      id="circleRadiusCheckbox"
                      type="checkbox"
                      checked={!circlStatus && circleRadius === 76}
                      onChange={(e) => {
                        setCirclStatus(false);
                        setCircleRadius(e.target.checked ? 76 : 0);
                      }}
                    />
                    <label htmlFor="circleRadiusCheckbox">
                      This Pellet Have No Inhibition Zone
                    </label>
                  </div>

                  <div className="checkbox-item">
                    <input
                      className="checkbox-left"
                      id="circleRadiusCheckbox2"
                      type="checkbox"
                      checked={!circlStatus && circleRadius === data[2]}
                      onChange={(e) => {
                        setCirclStatus(false);
                        setCircleRadius(e.target.checked ? data[2] : 0);
                      }}
                    />
                    <label htmlFor="circleRadiusCheckbox2">
                      Use Prediction
                    </label>
                  </div>
                  {/*   /**
                   * !  เพิ่ม setCirclStatus
                   *  */}
                  {edit_status == "true" && (
                    <div className="checkbox-item">
                      <input
                        className="checkbox-left"
                        id="circleRadiusCheckbox3"
                        type="checkbox"
                        checked={circlStatus} //เพิ่มใหม่
                        onChange={(e) => {
                          setCircleRadius(e.target.checked ? originalPixel : 0); //เพิ่มใหม่
                          setCirclStatus(true);
                        }}
                      />
                      <label htmlFor="circleRadiusCheckbox3">
                        original position
                      </label>
                    </div>
                  )}

                  {loading && (
                    <div className="loading-indicator">
                      Loading previous data...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="button-wrapper">
        <button className="button" type="button" onClick={handleEditData}>
          BACK
        </button>
        <button
          className="button"
          type="button"
          onClick={() => handleUpdateData(circleRadius)}
        >
          NEXT
        </button>
      </div>
    </form>
  );
}
