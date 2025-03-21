import cv2
import numpy as np
from os import path
from copy import copy
import PlateDetector
from util import show, draw_circle, resize

def detect(img, pad=0):
    # crop image at place
    try:
        img_blur = cv2.GaussianBlur(img, (5, 5),0)
        iter = 3
        kernel2 = np.ones((3, 3), np.uint8)
        dilation = cv2.dilate(img_blur, kernel2, iterations=iter)
        erosion = cv2.erode(dilation, kernel2, iterations=iter)
        
        detected_circles = cv2.HoughCircles(erosion,  
                        cv2.HOUGH_GRADIENT, dp=1, minDist=60, param1 = 60, # 
                    param2 = 20, minRadius = 61, maxRadius = 74)
        
        # expand the circles
        detected_circles[:,:,2] = detected_circles[:,:,2] + pad

        if len(detected_circles[0]) <= 1:
            return detect_sec(img, pad)

        return detected_circles
    
    except cv2.error as e:
        print("An OpenCV error occurred:", e)
        return "An OpenCV error occurred:", e 

    except Exception as e:
        print("No medicine detected:", e)
        return detect_sec(img, pad)

def detect_sec(image, pad=0):
    try:
        img_blur = cv2.GaussianBlur(image, (5, 5),0)
        iter = 2
        kernel2 = np.ones((3, 3), np.uint8)
        dilation = cv2.dilate(img_blur, kernel2, iterations=iter)
        erosion = cv2.erode(dilation, kernel2, iterations=iter)

        detected_circles = cv2.HoughCircles(erosion,  
                        cv2.HOUGH_GRADIENT, dp=1, minDist=20, param1 = 60, 
                    param2 = 21, minRadius =40, maxRadius = 55)
        
        detected_circles[:,:,2] = detected_circles[:,:,2] + pad

        if len(detected_circles[0]) == 0:
            return None
        else: return detected_circles
    
    except cv2.error as e:
        print("An OpenCV error occurred:", e)
        return "An OpenCV error occurred:", e 

    except Exception as e:
        print("No medicine2 detected:", e)
        return "No medicine2 detected:", e