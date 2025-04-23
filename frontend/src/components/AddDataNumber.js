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
//   // const [circleRadius, setCircleRadius] = useState(data[2]); 
//   const [circleRadius, setCircleRadius] = useState([]);

//   const [circleRadiusOld, setCircleRadiusOld] = useState([]);
//   const [originalPixel, setOriginalPixel] = useState(null); // add

//   const [loading, setLoading] = useState(false);
//   const [circlStatus, setCirclStatus] = useState(true);
//   /**
//    * !  เพิ่ม setCirclStatus
//    * */
//   const edit_status = localStorage.getItem("edit_status");
//   const savedData = JSON.parse(localStorage.getItem("datePx"));
//   const savedNamePx = localStorage.getItem("namePx"); // add
//   const [previousRadius, setPreviousRadius] = useState([]);

//   const [noZoneRadius, setNoZoneRadius] = useState(76);

//   useEffect(() => {
//     if (testId) {
//       fetchPreviousData();
//     }
//   }, []);
//   /**
//    * !  เพิ่ม fetchPreviousData
//    * */
//   const fetchPreviousData = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("REACT_TOKEN_AUTH_KEY");
//       const response = await axios.get(
//         `https://asttestapp.onrender.com/ASTtest/inhibition/${testId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${JSON.parse(token)}`,
//           },
//         }
//       );

//       let diameterOld = [];
//       let pixelOld = [];

//       const medRadValue = response.data?.med_rad ?? 76; 
//       setNoZoneRadius(medRadValue);

//       if (
//         response.data &&
//         Array.isArray(response.data) &&
//         response.data.length > 0
//       ) {
//         const sortedData = [...response.data].sort(
//           (a, b) => a.zone_id - b.zone_id
//         );

//         diameterOld = sortedData.map((item) => item.diameter);
//         pixelOld = sortedData.map((item) => item); // add .pixel
//       }
//       if (edit_status == "true") {
//         const match = response.data.find(
//           (item) => item.antibiotic_name == savedNamePx
//         );
//         if (match) {
//           setPreviousRadius(diameterOld);
//           setCircleRadius(match.pixel); //
//           setCircleRadiusOld(match.pixel);
//           setOriginalPixel(match.pixel); //
//         }
//       } else {
//         setPreviousRadius(data[2]);
//         setCircleRadius(data[2]);
//         setCirclStatus(false);
//       }
//     } catch (error) {
//       console.error("Error fetching previous data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSliderChange = (value) => {
//     setCirclStatus(false);
//     setCircleRadius(value);
//   };

//   const handleUpdateData = () => {
//     // const realDiameter = (circleRadius / 40) * 6.35;
//     const realDiameter = circleRadius
//     const xPosition = data[0];
//     const yPosition = data[1];
    
//     console.log("Updating diameter (pixel) : ", realDiameter.toFixed(2));
//     console.log("Medicine Location : ", xPosition, yPosition);
//     updateData([parseFloat(realDiameter.toFixed(2)), xPosition, yPosition]);
//     onNext(); 
//   };

//   const handleEditData = () => {
//     editData();
//     onBack(); 
//   };

//   console.log("data (radius and position) : ", circleRadius, data[0], data[1]);

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
//                   {/* <label>{circleRadius} pixels ≈ {((circleRadius/40)*6.35).toFixed(2)} mm</label> */}
//                   <label>{circleRadius} pixels</label>
//                 </div>
//                 <Slider 
//                   min={40}  
//                   max={440} 
//                   step={0.01}
//                   value={circleRadius} 
//                   onChange={handleSliderChange}
//                 />
//                 <div className="checkbox-wrapper">
//                 <div className="checkbox-item">
//                     <input
//                       className="checkbox-left"
//                       id="circleRadiusCheckbox"
//                       type="checkbox"
//                       checked={!circlStatus && circleRadius === noZoneRadius}
//                       onChange={(e) => {
//                         setCirclStatus(false);
//                         setCircleRadius(e.target.checked ? noZoneRadius : 0);
//                       }}
//                     />
//                     <label htmlFor="circleRadiusCheckbox">
//                       This Pellet Have No Inhibition Zone
//                     </label>
//                   </div>
                  
//                   <div className="checkbox-item">
//                     <input
//                       className="checkbox-left"
//                       id="circleRadiusCheckbox2"
//                       type="checkbox"
//                       checked={!circlStatus && circleRadius === data[2]}
//                       onChange={(e) => {
//                         setCirclStatus(false);
//                         setCircleRadius(e.target.checked ? data[2] : 0);
//                       }}
//                     />
//                     <label htmlFor="circleRadiusCheckbox2">
//                       Use Prediction
//                     </label>
//                   </div>

//                   {/*   /**
//                    * !  เพิ่ม setCirclStatus
//                    *  */}
//                   {edit_status == "true" && (
//                     <div className="checkbox-item">
//                       <input
//                         className="checkbox-left"
//                         id="circleRadiusCheckbox3"
//                         type="checkbox"
//                         checked={circlStatus} // add
//                         onChange={(e) => {
//                           setCircleRadius(e.target.checked ? originalPixel : 0); // add
//                           setCirclStatus(true);
//                         }}
//                       />
//                       <label htmlFor="circleRadiusCheckbox3">
//                         Use Previous Prediction
//                       </label>
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
//           onClick={handleUpdateData}
//         >
//           NEXT
//         </button>
//       </div>
//     </form>
//   );
// }



import React, { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css'; 
import { usePointContext } from './usePointContext';
import DrawCircle from "./draw_circle";
import { useInputData } from './useInputData';
import '../styles/AddDataNumber.css';
import axios from 'axios';

export default function AddDataNumber({ onNext, onBack, currentInde, dataLength }) {
  const { data, updateData, editData } = usePointContext();
  const { testId } = useInputData();
  // const [circleRadius, setCircleRadius] = useState(data[2]); 
  const [circleRadius, setCircleRadius] = useState([]);

  const [circleRadiusOld, setCircleRadiusOld] = useState([]);
  const [originalPixel, setOriginalPixel] = useState(null); // add

  const [loading, setLoading] = useState(false);
  const [circlStatus, setCirclStatus] = useState(true);
  /**
   * !  เพิ่ม setCirclStatus
   * */
  const edit_status = localStorage.getItem("edit_status");
  const savedData = JSON.parse(localStorage.getItem("datePx"));
  const savedNamePx = localStorage.getItem("namePx"); // add
  const [previousRadius, setPreviousRadius] = useState([]);

  const [noZoneRadius, setNoZoneRadius] = useState(76);

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
        `https://asttestapp.onrender.com/ASTtest/inhibition/${testId}`,
        {
          headers: {
            Authorization: `Bearer ${JSON.parse(token)}`,
          },
        }
      );
  
      let diameterOld = [];
      let pixelOld = [];
  
      const medRadValue = response.data?.med_rad ?? 76; 
      setNoZoneRadius(medRadValue);
  
      const historyData = response.data?.history ?? [];
  
      if (Array.isArray(historyData) && historyData.length > 0) {
        const sortedData = [...historyData].sort(
          (a, b) => a.zone_id - b.zone_id
        );
  
        diameterOld = sortedData.map((item) => item.diameter);
        pixelOld = sortedData.map((item) => item.pixel);
  
        if (edit_status === "true") {
          const match = sortedData.find(
            (item) => item.antibiotic_name === savedNamePx
          );
          if (match) {
            setPreviousRadius(diameterOld);
            setCircleRadius(match.pixel);
            setCircleRadiusOld(match.pixel);
            setOriginalPixel(match.pixel);
          }
        } else {
          setPreviousRadius(data[2]);
          setCircleRadius(data[2]);
          setCirclStatus(false);
        }
      }
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
    // const realDiameter = (circleRadius / 40) * 6.35;
    const realDiameter = circleRadius
    const xPosition = data[0];
    const yPosition = data[1];
    
    console.log("Updating diameter (pixel) : ", realDiameter.toFixed(2));
    console.log("Medicine Location : ", xPosition, yPosition);
    updateData([parseFloat(realDiameter.toFixed(2)), xPosition, yPosition]);
    onNext(); 
  };

  const handleEditData = () => {
    editData();
    onBack(); 
  };

  console.log("data (radius and position) : ", circleRadius, data[0], data[1]);

  return (
    <form className="form-container">
      <div className="wrapper">
        <div className="left-side">
          <DrawCircle circleRadius={circleRadius} Xaxis={data[0]} Yaxis={data[1]}/>
        </div>
  
        <div className="right-side">
          <div className="card">
            <div className="card-header">
              <p>{currentInde} of {dataLength}</p>
            </div>
            <div className="card-body">
              <div className="slider-wrapper">
                <div className="slider-label">
                  <label>Confirm Inhibition Zone:</label>
                  {/* <label>{circleRadius} pixels ≈ {((circleRadius/40)*6.35).toFixed(2)} mm</label> */}
                  <label>{circleRadius} pixels</label>
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
                      checked={!circlStatus && circleRadius === noZoneRadius}
                      onChange={(e) => {
                        setCirclStatus(false);
                        setCircleRadius(e.target.checked ? noZoneRadius : 0);
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
                        checked={circlStatus} // add
                        onChange={(e) => {
                          setCircleRadius(e.target.checked ? originalPixel : 0); // add
                          setCirclStatus(true);
                        }}
                      />
                      <label htmlFor="circleRadiusCheckbox3">
                        Use Previous Prediction
                      </label>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <div className="button-wrapper">
        <button 
          className="button"
          type="button" 
          onClick={handleEditData}
        >
          BACK
        </button>
        <button 
          className="button"
          type="button" 
          onClick={handleUpdateData}
        >
          NEXT
        </button>
      </div>
    </form>
  );
}
