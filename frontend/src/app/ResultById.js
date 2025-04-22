import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useImageContext } from "../components/useImageContext";
import "../styles/ResultById.css";
import { toZonedTime } from 'date-fns-tz';
import { format } from "date-fns";

const ResultById = () => {
  const navigate = useNavigate();
  const [testInfo, setTestInfo] = useState([]);
  const [testResult, setTestResult] = useState([]);
  const { testId } = useParams();
  const [testData, setTestData] = useState([]);

  const date = new Date();
  const day = date.getDate();
  const monthName = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const time = `${hours}:${minutes}:${seconds}`;

  const location = useLocation();
  const [newDataPoint, setNewDataPoint] = useState([]);
  const { image } = useImageContext();
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const [historyData, setHistoryData] = useState([]);


  useEffect(() => {
    if (location.state?.newDataPoint) {
      setNewDataPoint(location.state.newDataPoint);
    }
  }, [location.state?.newDataPoint]);

  const fetchDataResultById = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/ASTtest/get_result_by_testID/${testId}`
      );
      const responseData = response.data;
      if (responseData) {
        setTestInfo(responseData.test_data);
        setTestResult(responseData.inhibition_zones);
        setHistoryData(responseData.inhibition_zone_history); // add edit date
      } else {
        console.error("No data received from API");
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  useEffect(() => {
    fetchDataResultById();
  }, [testId]);

  const test = testInfo && testInfo[0];
  const zone = testResult && testResult[0];

  // const formatDate = (dateString) => {
  //   if (!dateString) return "";
  //   const date = new Date(dateString);
  //   const day = date.getDate();
  //   const monthName = date.toLocaleString("default", { month: "long" });
  //   const year = date.getFullYear();
  //   const hours = date.getHours();
  //   const minutes = date.getMinutes().toString().padStart(2, "0");
  //   const seconds = date.getSeconds().toString().padStart(2, "0");
  //   return `${day} - ${monthName} - ${year} ${hours}:${minutes}:${seconds}`;
  // };

  const TimeZone = "Asia/Bangkok";
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const createDate = toZonedTime(date, TimeZone); 
    return format(createDate, "dd MMMM yyyy HH:mm:ss");  
  };

  const latestEditDate = historyData?.length
  ? formatDate(
      historyData
        .map((item) => new Date(item.edit_at))
        .sort((a, b) => b - a)[0]
    )
  : "N/A";


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
              {test && (
                <>
                  <div className="info-item">
                    <label className="font-bold">Test ID :&nbsp;</label>
                    <label>{test.test_id}</label>
                  </div>
                  <div className="info-item">
                    <label className="font-bold">Edit at :&nbsp;</label>
                    {/* <label>{formatDate(test.created_at)}</label> */}
                    <label>{latestEditDate}</label>
                  </div>
                  <div className="info-item">
                    <label className="font-bold">Bacteria :&nbsp;</label>
                    <label>{test.bacteria_name}</label>
                  </div>
                  <div className="info-item">
                    <label className="font-bold">Modified by :&nbsp;</label>
                    <label>{test.username}</label>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="box">
          <div className="box-content">
            <p className="box-title">Antibiotics and Diameter</p>
            {testResult && testResult.map((data, index) => (
              <div key={index} className="antibiotic-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label>{`${data.antibiotic_name} : `}</label>
                <label>&nbsp;&nbsp;{data.diameter} mm</label>
              </div>
              {/* {data.resistant && ( <label>{`Interpretation ${data.resistant}`}</label>)} */}
              {data.resistant && data.resistant.trim() !== '' && (
                <label>{`Interpretation ${data.resistant}`}</label>
              )}
            </div>
            ))}
          </div>
        </div>
        </div>

        {/* Right Section: Image with Circles */}
        <div className="right-section">
          {test?.image_filename && (
            <div className="image-container">
              <img
                src={`http://localhost:3001/uploads/${test.image_filename}`}
                alt="AST Result"
              />
            </div>
          )}
        </div>
      </div>

      <div className="button-container">
        <button className="button" type="button" onClick={() => navigate("/")}>
          HOME
        </button>
        <button
          className="button"
          type="button"
          onClick={() => {
            /**
             * !  เพิ่ม localStorage
             * */
            localStorage.setItem("edit_status", true);
            navigate(`/edit/${test.test_id}`);
          }}
        >
          EDIT
        </button>
      </div>
    </div>
  );
};
export default ResultById;


