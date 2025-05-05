import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useImageContext } from '../components/useImageContext';
import '../styles/ImportImage.css';

const ImportImage = () => {
    const { image, setImageData } = useImageContext(); 
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [processedImage, setProcessedImage] = useState(image || null); 
    const navigate = useNavigate();

    const [isEditMode, setIsEditMode] = useState(false);
    useEffect(() => {
      const editStatus = localStorage.getItem("edit_status") === "true";
      setIsEditMode(editStatus);
    }, []);
  
    const handleDrop = (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        setImageData(file); 
        setProcessedImage(file);
      }
    };
  
    const handleDragOver = (e) => {
      e.preventDefault();
    };
  
    const handleFileInputChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setImageData(file); 
        setProcessedImage(file); 
      }
    };
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      if (!processedImage) {
        setStatus('No image selected');
        return;
      }
  
      const formData = new FormData();
      formData.append('image', processedImage); 
  
      try {
        setStatus('Processing image...');
        setLoading(true);
        const response = await fetch('https://asttestapp.onrender.com/ASTtest/process_image', {
          method: 'POST',
          body: formData,
        });
  
        if (response.ok) {
          setLoading(false);
          const blob = await response.blob();
          const imgUrl = URL.createObjectURL(blob); 
          setProcessedImage(imgUrl); 
          setImageData(imgUrl); 

          const medInfoHeader = response.headers.get('med-info');
          console.log('med-info header:', medInfoHeader);
          if (medInfoHeader) {
            const medInfo = JSON.parse(medInfoHeader);
            console.log('Extracted med-info:', medInfo);
            localStorage.setItem('medicineInfo', JSON.stringify(medInfo));
          }
          
          navigate('/analyze');
        } else {
          setStatus('Image upload failed: ' + response.statusText);
        }
      } catch (error) {
        setStatus('Image upload failed: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <main className="import-image-container">
        <div className="form-container">
          <h1 className="title">IMPORT IMAGE</h1>
  
          <form className="image-upload-form" onSubmit={handleSubmit}>
            <input
              className="hidden"
              type="file"
              accept="image/*"
              id="fileInput"
              onChange={handleFileInputChange}
            />
            <div
              className="image-drop-box"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('fileInput').click()}
            >
              {processedImage && processedImage instanceof Blob ? (
                <img src={URL.createObjectURL(processedImage)} alt="Uploaded Image" className="uploaded-image" />
              ) : (
                <p>Click to Upload</p>
              )}
            </div>
            <label className="status-text">
              {loading && <span>{loading}</span>}
              {status && <span>{status}</span>}
            </label>
          </form>
        </div>
  
        <div className="button-container">
          <button type="submit" onClick={handleSubmit} className="button">
            ANALYZE
          </button>
        </div>
      </main>
    );
  };
  
  export default ImportImage;
  