import cv2
import numpy as np
from os import path
from copy import copy
import PlateDetector
from util import show, draw_circle, resize

def detect(img, pad=0):
    # crop image at place
    try:
        img_blur = cv2.GaussianBlur(img, (3, 3),0) # change at 5.3.2025 from 5 to 3
        normalized_img = cv2.normalize(img_blur, None, 20, 350, cv2.NORM_MINMAX)
        iter = 3
        kernel2 = np.ones((5, 5), np.uint8)
        dilation = cv2.dilate(img_blur, kernel2, iterations=iter)
        erosion = cv2.erode(dilation, kernel2, iterations=iter)

        # _, img_th = cv2.threshold(erosion,190,255,cv2.THRESH_BINARY)
        
        detected_circles = cv2.HoughCircles(erosion,  
                        cv2.HOUGH_GRADIENT, dp=1, minDist=60, param1 = 60, # 
                    #param2 = 25, minRadius = 55, maxRadius = 74) # change min radius from 62 to 52 , param2 20 to 25
                    #param2 = 20, minRadius = 62, maxRadius = 74)
                    param2 = 22, minRadius = 60, maxRadius = 74)
        
        # expand the circles
        detected_circles[:,:,2] = detected_circles[:,:,2] + pad

        if len(detected_circles[0]) <= 1:
            return detect_sec(img, pad)

        return detected_circles
    
    except cv2.error as e:
        print("An OpenCV error occurred:", e)
        return "An OpenCV error occurred:", e  # Or handle the error differently

    except Exception as e:
        print("No medicine detected:", e)
        return detect_sec(img, pad)

def detect_sec(image, pad=0):
    try:
        img_blur = cv2.GaussianBlur(image, (5, 5),0)
        normalized_img = cv2.normalize(img_blur, None, 20, 350, cv2.NORM_MINMAX)
        iter = 2
        kernel2 = np.ones((3, 3), np.uint8)
        dilation = cv2.dilate(img_blur, kernel2, iterations=iter)
        erosion = cv2.erode(dilation, kernel2, iterations=iter)

        # _, img_th = cv2.threshold(erosion,190,255,cv2.THRESH_BINARY)

        detected_circles = cv2.HoughCircles(erosion,  
                        cv2.HOUGH_GRADIENT, dp=1, minDist=20, param1 = 60, # param 1 : 60 to 50
                    #param2 = 20, minRadius =41, maxRadius = 54) # minRadius 35 to 15 maxRadius 40 to 53
                    param2 = 22, minRadius =40, maxRadius = 55)
        
        # expand the circles
        detected_circles[:,:,2] = detected_circles[:,:,2] + pad

      
        if len(detected_circles[0]) == 0:
            return None
        else: return detected_circles
    
    except cv2.error as e:
        print("An OpenCV error occurred:", e)
        return "An OpenCV error occurred:", e  # Or handle the error differently

    except Exception as e:
        print("No medicine2 detected:", e)
        return "No medicine2 detected:", e