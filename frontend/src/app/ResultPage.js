import React, { useState, useEffect, useRef } from 'react';
import { useInputData } from '../components/useInputData';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useImageContext } from '../components/useImageContext';
import '../styles/ResultById.css';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const ResultPage = () => {
  const { testId, bacteria, testData: contextTestData = [] } = useInputData();
  const date = new Date();
  const location = useLocation();
  const { image } = useImageContext();
  const savedData = JSON.parse(localStorage.getItem("datePx"));
  const navigate = useNavigate();
  const [newDataPoint, setNewDataPoint] = useState("");

  console.log("Location state:", location.state);
  
  // Create state to store final data to display
  const [finalTestData, setFinalTestData] = useState([]);
  const canvasRef = useRef(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const TimeZone = 'Asia/Bangkok';
  const bangkokDate = toZonedTime(date, TimeZone);
  const formattedDateTime = format(bangkokDate, 'yyyy-MM-dd HH:mm:ss');

  const token = localStorage.getItem('REACT_TOKEN_AUTH_KEY');
  let usernameEdit = '';
  if (token) {
    try {
      const decoded = jwtDecode(token);
      usernameEdit = decoded.sub;
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  // add fetch usernameCreate by test id
  const [testData, setTestData] = useState(null);
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const response = await axios.get(`https://asttestapp.onrender.com/ASTtest/get_test_data_by_Id/${testId}`);
        setTestData(response.data);
      } catch (err) {
        setError('Failed to fetch test data');
        console.error('Error fetching test data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTestData();
  }, [testId]);
  const usernameCreate = testData?.username || 'Unknown';


  useEffect(() => {
    if (location.state?.newDataPoint) {
      setNewDataPoint(location.state.newDataPoint);
    }
  }, [location.state?.newDataPoint]);

  // Set finalTestData when component loads
  useEffect(() => {
    console.log("Location state raw:", location.state);
    
    if (location.state?.testData) {
      console.log("TestData structure:", 
        location.state.testData.map((item, i) => ({
          index: i,
          type: Array.isArray(item) ? "Array" : typeof item,
          length: Array.isArray(item) ? item.length : 'N/A',
          value: item
        }))
      );
    }
    
    if (location.state?.testData && Array.isArray(location.state.testData) && location.state.testData.length > 0) {
      console.log("Using data from location.state:", location.state.testData);
      
      const processedData = location.state.testData.map(item => {
        if (Array.isArray(item)) {
          return [
            item[0] || 'Unknown',                   // antibiotic name
            item[1] || 'Unknown',                   // Sir
            parseFloat(item[2] || 0).toFixed(2),    // diameter
            parseFloat(item[3] || 0),               // x_position
            parseFloat(item[4] || 0)                // y_position
          ];
        } else if (typeof item === 'object') {
          return [
            item.antibiotic_name || 'Unknown',
            item.resistant || 'Unknown',
            parseFloat(item.diameter || 0).toFixed(2),
            parseFloat(item.x_position || 0), 
            parseFloat(item.y_position || 0)
          ];
        }
        return ['Unknown', 'Unknown', '0.00', 0, 0];
      });
      
      console.log("Processed data for display:", processedData);
      setFinalTestData(processedData);
    } 
    // If not available, use data from context
    else if (contextTestData && Array.isArray(contextTestData) && contextTestData.length > 0) {
      console.log("Using data from context:", contextTestData);
      setFinalTestData(contextTestData);
    } else {
      console.warn("No test data available");
    }
  }, [location.state, contextTestData]);

  // Load image and data
  useEffect(() => {
    if (!image) {
      console.warn("No image available");
      return;
    }

    const img = new Image();
    img.src = image;
    
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      
      // Use data from finalTestData
      if (finalTestData && finalTestData.length > 0) {
        console.log("Drawing labels with data:", finalTestData);
        drawImageWithLabels(img);
      } else {
        console.warn("Cannot draw labels: No test data available");
      }
    };
  }, [image, finalTestData]);

  const drawImageWithLabels = (img) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas element not available");
      return;
    }

    const ctx = canvas.getContext('2d');
    // Set canvas size to match image
    canvas.width = img.width || 500;
    canvas.height = img.height || 500;
    
    // Draw background image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Use finalTestData
    if (finalTestData && Array.isArray(finalTestData) && finalTestData.length > 0) {
      console.log("Drawing with data points:", finalTestData.length);
      
      // Calculate optimal positions for items without coordinates
      const labelPositions = calculateOptimalPositions(
        canvas.width, 
        canvas.height, 
        finalTestData.length
      );
      
      finalTestData.forEach((data, index) => {
        console.log(`Drawing label ${index}:`, data);
        
        let diameter, antibioticName, resistant, x, y;
        
        if (Array.isArray(data)) {
          antibioticName = data[0] || 'Unknown';
          resistant = data[1] || '';
          diameter = parseFloat(data[2]) || 0;
          
          if (data.length >= 5) {
            x = parseFloat(data[3]);
            y = parseFloat(data[4]);
            console.log(`Using coordinates from array: (${x}, ${y})`);
          } else {
            console.log(`No coordinates in array for item ${index}`);
            x = undefined;
            y = undefined;
          }
        } else if (typeof data === 'object') {
          antibioticName = data.antibiotic_name || 'Unknown';
          resistant = data.resistant || '';
          diameter = parseFloat(data.diameter) || 0;
          x = parseFloat(data.x_position);
          y = parseFloat(data.y_position);
          console.log(`Using coordinates from object: (${x}, ${y})`);
        } else {
          console.error(`Invalid data format for item ${index}:`, data);
          return;
        }
        
        if (x === undefined || y === undefined || isNaN(x) || isNaN(y) || (x === 0 && y === 0)) {
          console.log(`Using fallback position for item ${index}`);
          const position = labelPositions[index] || { x: canvas.width / 2, y: canvas.height / 2 };
          x = position.x;
          y = position.y;
        }
        
        console.log(`Final drawing position: x=${x}, y=${y}`);
        
        // Position for antibiotic name text
        const textX = x;
        const textY = y - 30;
        
        let shortName = antibioticName;
        const match = antibioticName.match(/^([A-Za-z0-9\/]+):/);
        if (match && match[1]) {
            shortName = match[1];
        } else if (antibioticName.length > 8) {
            shortName = antibioticName.substring(0, 8) + '...';
        }
        
        // text background
        ctx.font = "bold 55px Arial Black";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const textWidth = ctx.measureText(shortName).width;
        const textHeight = 60;
        
        // Add shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        // Draw text box with border
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(textX - textWidth / 2 - 20, textY - textHeight / 2 - 10, textWidth + 40, textHeight + 20);
        
        // Clear shadow before drawing border
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.lineWidth = 6;
        ctx.strokeStyle = 'red';
        ctx.strokeRect(textX - textWidth / 2 - 20, textY - textHeight / 2 - 10, textWidth + 40, textHeight + 20);
        
        // Add shadow for text
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw text
        ctx.fillStyle = 'red';
        ctx.fillText(shortName, textX, textY);
        
        // Clear shadow before drawing diameter
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Show diameter value
        ctx.font = "bold 40px Arial";
        const diameterText = `${diameter} mm`;
        
        // Calculate position for diameter
        const diamTextY = y + 60;
        
        // Draw text box for diameter
        const diamTextWidth = ctx.measureText(diameterText).width;
        
        // Add shadow for box
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(x - diamTextWidth / 2 - 15, diamTextY - 25, diamTextWidth + 30, 50);
        
        // Clear shadow before drawing border
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'black';
        ctx.strokeRect(x - diamTextWidth / 2 - 15, diamTextY - 25, diamTextWidth + 30, 50);
        
        // Add shadow for text
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillStyle = 'black';
        ctx.fillText(diameterText, x, diamTextY);
        
        // Clear shadow when done
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      });
    } else {
      console.warn("No test data available for drawing");
    }
  };

  const calculateOptimalPositions = (width, height, count) => {
    const positions = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    if (count <= 1) {
      positions.push({ x: centerX, y: centerY });
    } else if (count === 2) {
      positions.push({ x: centerX - radius / 2, y: centerY });
      positions.push({ x: centerX + radius / 2, y: centerY });
    } else {
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        positions.push({ x, y });
      }
    }
    
    return positions;
  };

  // Convert blob URL to file
  async function blobUrlToFile(blobUrl, filename) {
    const res = await fetch(blobUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
  }
  
  /**
   * !  เพิ่ม pixels: savedData[index][1]
   * */
  const ApiSendData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      if (!testId) {
        setError('Missing test ID');
        setIsLoading(false);
        return;
      }
      
      if (!bacteria) {
        setError('Missing bacteria information');
        setIsLoading(false);
        return;
      }
      
      if (!finalTestData || !Array.isArray(finalTestData) || finalTestData.length === 0) {
        setError('No test data available');
        setIsLoading(false);
        return;
      }
      
      const formattedTestData = finalTestData.map((data, index) => {
        if (Array.isArray(data)) {
          return {
            antibiotic_name: data[0] || '',    // antibiotic name 
            resistant: data[1] || '',          // Sir
            diameter: parseFloat(data[2]) || 0, // diameter 
            x_position: data[3] || 0,           // x position
            y_position: data[4] || 0,           // y position
            pixels: savedData[index][1]
          };
        } else {
          return {
            antibiotic_name: data.antibiotic_name || '', 
            resistant: data.resistant || '',         
            diameter: parseFloat(data.diameter) || 0,   
            x_position: data.x_position || 0,        
            y_position: data.y_position || 0,          
            pixels: savedData[index][1]
          };
        }
      });
      
    
      const filename = `test_${testId}_${Date.now()}.png`;
    
      let fileFromBlob;
      try {
        // Use image from canvas with labels
        if (canvasRef.current) {
          const canvasDataUrl = canvasRef.current.toDataURL('image/png');
          const canvasBlob = await (await fetch(canvasDataUrl)).blob();
          fileFromBlob = new File([canvasBlob], filename, { type: 'image/png' });
        } else {
          // Use original image if canvas not available
          fileFromBlob = await blobUrlToFile(image, filename);
        }
      } catch (error) {
        console.error("Failed to convert image to File:", error.message);
        setError("Failed to process image");
        setIsLoading(false);
        return;
      }
    
      const formData = new FormData();
      formData.append('image', fileFromBlob);
      formData.append('data', JSON.stringify({
        testId,
        bacteriaName: bacteria,
        usernameEdit,
        usernameCreate,
        newDataPoint: formattedTestData,
        createdAt: formattedDateTime
      }));
    
      console.log('Sending data:', formattedTestData);
    
      const response = await axios.post(
        'https://asttestapp.onrender.com/ASTtest/add_data',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${JSON.parse(token)}`
          }
        }
      );
    
      if (response && response.status === 200) {
        navigate('/');
      } else {
        setError('Failed to save data');
      }
    } catch (error) {
      console.error('Error Add data:', error.message);
      setError(error.response?.data?.error || 'An error occurred while saving data');
    } finally {
      setIsLoading(false);
    }
  };

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
                <label className="font-bold">Created on :&nbsp;</label>
                <label>{formattedDateTime}</label>
              </div>
              <div className="info-item">
                <label className="font-bold">Bacteria :&nbsp;</label>
                <label>{bacteria}</label>
              </div>
              <div className="info-item">
                <label className="font-bold">Created by :&nbsp;</label>
                <label>{usernameCreate}</label>
              </div>
            </div>
          </div>

          <div className="box">

            <div className="box-content">
              <p className="box-title">Antibiotics and Diameter</p>
              {finalTestData && Array.isArray(finalTestData) && finalTestData.length > 0 ? (
                finalTestData.map((data, index) => {
                  // Handle both array and object formats
                  let antibioticName, resistant, diameter;
                  
                  if (Array.isArray(data)) {
                    antibioticName = data[0] || 'Unknown';
                    resistant = data[1] || '';
                    diameter = data[2] || 0;
                  } else {
                    antibioticName = data.antibiotic_name || 'Unknown';
                    resistant = data.resistant || '';
                    diameter = data.diameter || 0;
                  }
                  return (
                    // <div key={index} className="mb-4 md:mb-2 flex flex-col md:flex-row w-4/5 justify-between">
                    //   <label className="font-bold">{antibioticName}</label>
                    //   <label>
                    //     {antibioticName !== 'Antimicrobial or Bacteria not found' && <label>{resistant}</label>}
                    //     <label>&nbsp;&nbsp;({diameter} mm)</label>
                    //   </label>
                    // </div>
                    <div key={index} className="antibiotic-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <label>{`${antibioticName} : `}</label>
                        <label>&nbsp;&nbsp;{diameter} mm</label>
                      </div>
                      {/* {data.resistant && ( <label>{`Interpretation ${data.resistant}`}</label>)} */}
                      {resistant && resistant.trim() !== '' && (
                        <label>{`Interpretation ${resistant}`}</label>
                      )}
                    </div>
                  );
                })
              ) : (
                <p>No test data available</p>
              )}
            </div>

          </div>
        </div>

        {/* Right Section: Display Image with Labels */}
        <div className="right-section">
          <div className="image-container">
            <canvas
              ref={canvasRef}
              className="result-image extra-large"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </div>
      </div>
      
      <div className="button-container">
        <button 
          className="button" 
          type="button" 
          onClick={() => navigate('/')}
          disabled={isLoading}
        >
          HOME
        </button>
        <button 
          className="button" 
          type="button" 
          onClick={() => ApiSendData()}
          disabled={isLoading}
        >
          {isLoading ? 'SAVING...' : 'SAVE'}
        </button>
      </div>
    </div>
  );
};
export default ResultPage; 
