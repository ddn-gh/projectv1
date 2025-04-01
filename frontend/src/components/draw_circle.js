import React, { useEffect, useRef } from 'react';
import { useImageContext } from './useImageContext';

export default function DrawCircle({ circleRadius, Xaxis, Yaxis }) {
    const canvasRef = useRef(null);
    const { image } = useImageContext();

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const x = Xaxis / 4;
        const y = Yaxis / 4;

        // Clear canvas (if needed)
        // context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw image
        const img = new Image();
        img.src = image; // Use the image prop from context
        img.onload = () => {
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Draw circle
            context.beginPath();
            context.arc(x, y, circleRadius / 4, 0, 2 * Math.PI);
            context.lineWidth = 2;
            context.strokeStyle = 'red';
            context.stroke();
        };
    }, [image, circleRadius, Xaxis, Yaxis]);

    return (
        <canvas className="rounded-lg w-[320px] md:w-[500px]" ref={canvasRef} width={500} height={500} />
    );
}