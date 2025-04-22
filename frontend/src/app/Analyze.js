import React, { useState, useEffect } from 'react';
import { PointProvider } from '../components/usePointContext';
import AddDataName from '../components/AddDataName';
import AddDataNumber from '../components/AddDataNumber';
import axios from 'axios';

const AnalyzeImage = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showNameInput, setShowNameInput] = useState(true);
    const [dataSet, setDataSet] = useState([]);

    const fetchDataFromApi = async () => {
        try {
            const response = await axios.get('https://asttestapp.onrender.com/ASTtest/med_info');
            const responseData = response.data
            if (responseData) {
                setDataSet(responseData);
            } else {
                console.error('No data received from API');
            }
        } catch (error) {
            console.error('Error fetching data:', error.message);
        }
    };

    useEffect(() => {
        fetchDataFromApi()
    }, []);

    const handleNext = () => {
        setCurrentIndex(prevIndex => prevIndex + 1);
        setShowNameInput(true); // กลับไปแสดงชื่อหลังจากกด Next
    };

    const handleBack = () => {
        setShowNameInput(true); // กลับไปแสดงชื่อหลังจากกด Next
    };

    const handleShowNumberInput = () => {
        setShowNameInput(false); // แสดงตัวเลขแทนชื่อ
    };

    return (
        <div className="mt-20 w-full mx-auto">
            <h1 className="text-2xl md:text-4xl pb-8 md:pb-16 font-bold text-center">Analyze Image</h1>
            <PointProvider pointData={dataSet} index={currentIndex}>
                {showNameInput ? (
                    <AddDataName onShowNumberInput={handleShowNumberInput} currentInde={currentIndex + 1} dataLength={dataSet.length} />
                ) : (
                    <AddDataNumber onNext={handleNext} onBack={handleBack} currentInde={currentIndex + 1} dataLength={dataSet.length} />
                )}
            </PointProvider>
        </div>
    );
}
export default AnalyzeImage;
