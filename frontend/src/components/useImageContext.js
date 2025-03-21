import React, { createContext, useState, useContext } from 'react';
const ImageContext = createContext();

export const useImageContext = () => useContext(ImageContext);

export const ImageProvider = ({ children }) => {
  const [image, setImageDataUrl] = useState(null); // State to store image URL

  const setImageData = (url) => {
    setImageDataUrl(url); // Function to update the image URL state
  };

  return (
    <ImageContext.Provider value={{ image, setImageData }}>
      {children} {/* Provide children elements (other components) access to the context */}
    </ImageContext.Provider>
  );
};
