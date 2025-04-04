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
  const [circleRadius, setCircleRadius] = useState(data[2]); 

  const handleSliderChange = (value) => {
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
                      id="circleRadiusCheckbox"
                      type="checkbox"
                      checked={circleRadius === 76}
                      onChange={(e) => setCircleRadius(e.target.checked ? 76 : 0)}
                    />
                    <label htmlFor="circleRadiusCheckbox">
                      This Pellet Have No Inhibition Zone
                    </label>
                  </div>
                  
                  <div className="checkbox-item">
                    <input
                      id="circleRadiusCheckbox2"
                      type="checkbox"
                      checked={circleRadius === data[2]}
                      onChange={(e) => setCircleRadius(e.target.checked ? data[2] : 0)}
                    />
                    <label htmlFor="circleRadiusCheckbox2">
                      Use Prediction
                    </label>
                  </div>
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
          onClick={() => handleUpdateData(circleRadius)}
        >
          NEXT
        </button>
      </div>
    </form>
  );
}