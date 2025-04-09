'''
import base64
from datetime import datetime
from io import BytesIO
import os
import random
import cv2
from flask_restx import Resource, Namespace, fields
from flask import logging, make_response, request, jsonify, send_file
import numpy as np
import pandas as pd
import psycopg2
from model import ASTtest, InhibitionZone, InhibitionZoneHistory, TestHistory, User
from flask_jwt_extended import get_jwt_identity, jwt_required, decode_token, verify_jwt_in_request
from PIL import Image
from exts import db
from werkzeug.utils import secure_filename
import PlateDetector
import MedicineDetector
from scipy.stats import trim_mean
from util import resize, moving_average, adjust_brightness
from scipy.ndimage import median_filter
from scipy.signal import find_peaks
import time
from sqlalchemy import and_

UPLOAD_FOLDER = 'uploads'  # โฟลเดอร์สำหรับเก็บภาพ
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_latest_edit_number(test_id):
    # ฟังก์ชันสมมุติ ถ้ายังไม่มี สามารถเปลี่ยนเป็น query count ได้
    history = InhibitionZoneHistory.query.filter_by(test_id=test_id).order_by(InhibitionZoneHistory.number_of_test.desc()).first()
    return history.number_of_test if history else 0

class PelletsDetector:
    def __init__(self):
        self.img_crop = None
        self.med_circles = None
        self.plate_circle = None
        self.plate_radius = None
        self.scale_factor = None
        self.med_loc = None
        self.med_rad = None
        self.inhibition_zone_diam = None
        self.pellets = None
    
    def process_image(self, image_path):
        if  image_path is not None:
            img = image_path
            # Convert to grayscale
            # img = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)
                        # img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
          
            img = PlateDetector.resize(img, 2000)
            try:
                self.plate_circle = PlateDetector.detect_plate(img)
                self.plate_radius = self.plate_circle[0, 0, 2]
            except Exception as e:
                print('PlateDetector Error',e)
                return str(e)  

            try:
                self.img_crop = PlateDetector.circle_crop(img, self.plate_circle, pad=0, normalize_size=True)
                self.med_circles = MedicineDetector.detect(self.img_crop, pad=0)
                plate_radius_real = 6.35 / 2
                self.scale_factor = plate_radius_real / np.mean(self.med_circles[0, :, 2])

                self.med_loc = [(float(self.med_circles[0, i, 0]), float(self.med_circles[0, i, 1])) for i in range(len(self.med_circles[0]))]
                self.med_rad = [int(np.floor(self.med_circles[0, i, -1])) for i in range(len(self.med_circles[0]))]
                self.pellets = [PlateDetector.circle_crop(self.img_crop, self.med_circles[0][i].reshape((1, 1, -1)), pad=150, normalize_size=False) for i in range(len(self.med_circles[0]))]
            except Exception as e:
                print('MedicineDetector Error',e)
                return str(e)  
            
            return self.img_crop
        else: return("image not found")
    
    def polar_coord_T(theta, r, cen_p:tuple)->tuple:
        """ transform polar coordinates to x ,y coordinates
            cen_p : a center point is the point(x,y) where r=0
        """
        
        # transfrom degree to radians.
        theta = 2*np.pi*theta/360
        
        dx = r * np.cos(theta)
        dy = r * np.sin(theta)
        
        x = dx + cen_p[0]
        y = dy + cen_p[1]
        
        return np.array([x, y]).T
    
    def img_polar_transfrom(img, cen_p):
        """transform image to polar coordinates
        """
        img_size = img.shape[0]
        intencities = []

        for r in range(0,img_size):
            coor = PelletsDetector.polar_coord_T(np.arange(0,360, 1) , r, cen_p).astype(int)
            intencity = img[coor[:,1], coor[:,0]]
            intencities.append(intencity)

            # exit if cordinate out of image size
            if np.any(coor<=0) or np.any(coor>=img_size-1):
                break
            
        return np.array(intencities)
    
    def calculate_trimmed_mean(inten, proportion=0.2):
        """calculate trimmed mean of each ranged
        """
        return trim_mean(inten, proportion)
        
    def predict_diameter(self):
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(3, 3))
        kernel2 = np.ones((6, 6), np.uint8)
        img_polar = []
        global closing_list
        closing_list = []
        inhibition_zone_pixels = []
        inhibition_zone_diam = []

        for i in range(len(self.med_loc)):
            img_polar = PelletsDetector.img_polar_transfrom(self.img_crop, self.med_loc[i])
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(3, 3))
            img_clahe = clahe.apply(img_polar)
            sharpened = cv2.filter2D(img_clahe, -1, np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]]))

            blurred_image = cv2.GaussianBlur(sharpened, (5, 5), 0)
            blurred_image = median_filter(blurred_image, size=5)
            erosion = cv2.erode(blurred_image, kernel2, iterations=1)
            dilation = cv2.dilate(erosion, kernel2, iterations=1)
            closing = cv2.morphologyEx(dilation, cv2.MORPH_CLOSE, kernel2)

            brightness = 0.3
            contrast = 1.5
            sharpened = cv2.addWeighted(closing, contrast, np.zeros(closing.shape, closing.dtype), 0, brightness)
            normalized = cv2.normalize(sharpened, None, 0, 255, cv2.NORM_MINMAX)
            closing_list.append(normalized.astype(np.uint8))

        intensity_r = []
        global_closing_list_sort = closing_list

        for i in range(len(self.med_loc)):
            global_closing_list_sort[i] = np.sort(closing_list[i])
        for i in range(len(self.med_loc)):
            intensity_r.append([PelletsDetector.calculate_trimmed_mean(inten) for inten in global_closing_list_sort[i][0:440]])

        for i in range(len(self.med_loc)):
            y = np.array(intensity_r[i]).astype(float)
            y = y / 255 * 100
            y_mavg = moving_average(y, 3)
            for r in range(self.med_rad[0]):
                y_mavg[r] = 100
            
            all_change_points = []

            for x in range(0,360,5): 
                angle_profile = global_closing_list_sort[i][:, x]
                angle_profile = angle_profile / 255 * 100
                
                angle_y_mavg = moving_average(angle_profile, 3)
                for r in range(self.med_rad[0]):
                    angle_y_mavg[r] = 100
                    
                angle_dy = np.diff(angle_y_mavg)
                angle_dy[:self.med_rad[0] + 20] = np.abs(angle_dy[:self.med_rad[0] + 20])
                
                threshold = np.mean(moving_average(abs(angle_dy), 3)) / np.std(angle_dy) + 0.45
                angle_change_points = np.arange(0, len(angle_dy), 2)[(angle_dy)[::2] > threshold]
                all_change_points.extend(angle_change_points)

            img_width = closing_list[i].shape[0]
            max_height = 450 if img_width > 450 else img_width
            
            filtered_change_points = [cp for cp in all_change_points if cp < max_height]
            
            bins = np.arange(0, max_height, 5)
            hist, bin_edges = np.histogram(filtered_change_points, bins=72)
            bin_centers = (bin_edges[:-1] + bin_edges[1:]) / 2
            
            non_zero_bins = np.where(hist > 0)[0]
            
            if len(non_zero_bins) == 0:
                selected_peak_index = 0
            else:
                first_bar_index = non_zero_bins[0]
                max_bin_index = np.argmax(hist)
                
                peaks, _ = find_peaks(hist, height=0.2 * np.max(hist))
                peaks_after = [p for p in peaks if p >= first_bar_index + 10]
                
                if len(peaks) > 5:
                    selected_peak_index = np.argmax(hist)
                else:
                    if first_bar_index <= max_bin_index < first_bar_index + 10:
                        if hist[max_bin_index] >= 0.7 * hist[first_bar_index]:
                            selected_peak_index = max_bin_index
                        else:
                            selected_peak_index = first_bar_index
                    else:
                        selected_peak_index = max_bin_index
                    
                    if peaks_after:
                        selected_peak_index = peaks_after[0]
                        
            if hist[selected_peak_index] <= 35:
                most_frequent_y_range = bin_centers[first_bar_index]
            else:
                most_frequent_y_range = bin_centers[selected_peak_index]
              
            predict_radius = most_frequent_y_range - self.med_rad[i]
            inhibition_zone_diam.append(round((self.med_rad[i] + predict_radius) * self.scale_factor * 2, 2))
            inhibition_zone_pixels.append(int(self.med_rad[i] + predict_radius))

        self.inhibition_zone_pixels = inhibition_zone_pixels
        self.inhibition_zone_diam = inhibition_zone_diam
        print(f"Inhibition Zone Pixels: {self.inhibition_zone_pixels}")
        print(f"Inhibition Zone Diameter: {self.inhibition_zone_diam}")
      

class Interpretator:
    def __init__(self):
        self.test_id = None
        self.bacteria_name = None
        self.username = None
        self.new_data_point = None
        self.input_antibiotic = None
        self.input_diam = None
        self.input_bacteria = None
        
    def callable_zone(self):
        df = pd.read_csv(r"annotion.csv")
        s = df['S']
        i = df['I']
        r = df['R']
        df = df.drop(columns=['SDD'])

        input_antibiotic = self.input_antibiotic
        input_diam = self.input_diam
        input_bacteria = self.input_bacteria
        
        try:
            med_index = df.loc[(df['Antimicrobial Agent'] == input_antibiotic) & (df['Bacteria'] == input_bacteria)].index.astype(int)[0]
            print(f"Searching for: {input_antibiotic} and {input_bacteria} in DataFrame")
        except IndexError:
            return f"No data for interpretation {input_antibiotic}",' : ', input_diam
        
        if pd.isna(s[med_index]) or pd.isna(i[med_index]) or pd.isna(r[med_index]):
            return "Data is NaN for the given index",'', input_diam
        
        condition_s = s[med_index] # Extracting the condition from the list
        ass = i[med_index].split()
        condition_i = ass[0] + ' and input_antibiotic ' + ass[1]
        condition_r = r[1]
        
        print(f"Evaluating: {str(input_diam)} {condition_s}")

        if eval(str(input_diam) + condition_s):
            print("Condition is S")
            return [input_antibiotic, '(S) ', input_diam , ' mm ']
        
        elif eval(str(input_diam) + condition_i):
            print("Condition is I")
            return [input_antibiotic, '(I) ', input_diam , ' mm ']
        
        elif eval(str(input_diam) + condition_r):
            print("Condition is R")
            return [input_antibiotic, '(R) ', input_diam , ' mm ']
        
        else: return ["Error", f"Antimicrobial or Bacteria not found {input_diam}", None]

newtest_ns = Namespace("ASTtest", description="A namespace for Test")
pellets_detector = PelletsDetector()
interpretion = Interpretator()

basedir = os.path.abspath(os.path.dirname(__file__))
uploads_path = os.path.join(basedir, '/uploads')

# Model serializer for AST test
ast_test_model = newtest_ns.model(
    'ASTtest',
    {
        "test_id": fields.Integer(),
        "bacteria_name": fields.String(),
        "username": fields.String(),
        "created_at": fields.DateTime()
    }
)
change_log_model = newtest_ns.model(
    'TestHistory',
    {
        "history_id": fields.Integer(),
        "test_id": fields.Integer(),
        "username": fields.String(),
        "old_value": fields.String(),
        "new_value": fields.String(),
        "edit_at": fields.DateTime()
    }
)
inhibition_zone_model = newtest_ns.model(
    'InhibitionZone',
    {
        "zone_id": fields.Integer(),
        "test_id": fields.Integer(),
        "antibiotic_name": fields.String(),
        "diameter": fields.Float(),
        "resistant": fields.String(),
        "username": fields.String(),
        "created_at": fields.DateTime()
    }
)
inhibition_zone_history_model = newtest_ns.model(
    'InhibitionZoneHistory',
    {
        "history_id": fields.Integer(),
        "test_id": fields.Integer(),
        "number_of_test": fields.Integer(),
        "antibiotic_name": fields.String(),
        "diameter": fields.Float(),
        "resistant": fields.String(),
        "username": fields.String(),
        "edit_at": fields.DateTime()
    }
)

import logging
logging.basicConfig(level=logging.DEBUG) 
@newtest_ns.route('/process_image')
class ProcessImage(Resource):
    def post(self):
        try:
            # Check if the 'image' field exists in the uploaded files
            if 'image' not in request.files:
                return f"Error No file upload {str(e)}", 400
        
            image_file = request.files['image']
        
            # Check if the file is empty
            if image_file.filename == '':
                return f"Error no select file {str(e)}", 400
            
            # Read the file content as bytes and process the image
            file_bytes = np.frombuffer(image_file.read(), np.uint8)
            image = cv2.imdecode(file_bytes, cv2.IMREAD_GRAYSCALE)

            if image is None:
                return f"Error while decode image {str(e)}", 400

            try:
                image_array = pellets_detector.process_image(image)
            except Exception as e:
                error_message = str(e) 
                logging.error(f"Error during image processing: {error_message}")
                return f"Error while process image {str(e)}", 500

            # Convert the processed numpy array back to an image file
            img_io = BytesIO()
            Image.fromarray(image_array).save(img_io, 'PNG')
            img_io.seek(0)

            try:
                pellets_detector.predict_diameter()
            except Exception as e:
                # Convert error to a string before returning
                error_message = str(e) 
                logging.error(f"Error during prediction: {error_message}")
                return f"Error while process image {str(e)}", 500

            return send_file(img_io, mimetype='image/png')

        except Exception as e:
            error_message = str(e) 
            logging.error(f"Unexpected error: {error_message}")
            return f"Error while import image {str(e)}", 500


class PelletsDetector2:
    def __init__(self):
        self.img_crop = None
        self.med_circles = None
        self.plate_circle = None
        self.plate_radius = None
        self.scale_factor = None
        self.med_loc = None
        self.med_rad = None
        self.inhibition_zone_diam = None
        self.inhibition_zone_pixels = None
        self.pellets = None

    def process_image(self, image):
        if image is None:
            return "image not found"

        try:
            # Step 1: Resize image
            img = PlateDetector.resize(image, 2000)

            # Step 2: เพิ่ม Contrast / Sharpen ก่อนส่งเข้า PlateDetector
            img = cv2.equalizeHist(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY))  # convert + histogram equalization
            img = cv2.GaussianBlur(img, (3, 3), 0)  # blur เล็กน้อยเพื่อลด noise
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)  # convert back to BGR

            # Step 3: Detect plate
            self.plate_circle = PlateDetector.detect_plate(img)
            if isinstance(self.plate_circle, np.ndarray):
                if self.plate_circle.ndim == 3:
                    self.plate_radius = self.plate_circle[0, 0, 2]
                elif self.plate_circle.ndim == 2:
                    self.plate_radius = self.plate_circle[0, 2]

            # Step 4: Crop plate area
            self.img_crop = PlateDetector.circle_crop(img, self.plate_circle, pad=0, normalize_size=True)

            # Step 5: Detect medicines (ปรับ padding เพิ่มได้)
            self.med_circles = MedicineDetector.detect(self.img_crop, pad=10)

            if self.med_circles is None or len(self.med_circles[0]) == 0:
                raise ValueError("No medicine circles detected")

            plate_radius_real = 6.35 / 2
            self.scale_factor = plate_radius_real / np.mean(self.med_circles[0, :, 2])

            self.med_loc = [(float(self.med_circles[0, i, 0]), float(self.med_circles[0, i, 1])) for i in range(len(self.med_circles[0]))]
            self.med_rad = [int(np.floor(self.med_circles[0, i, -1])) for i in range(len(self.med_circles[0]))]
            self.pellets = [PlateDetector.circle_crop(self.img_crop, self.med_circles[0][i].reshape((1, 1, -1)), pad=150, normalize_size=False) for i in range(len(self.med_circles[0]))]

            return self.img_crop

        except Exception as e:
            print('[process_image] Error:', e)
            return str(e)


    @staticmethod
    def polar_coord_T(theta, r, cen_p: tuple) -> tuple:
        theta = 2 * np.pi * theta / 360
        dx = r * np.cos(theta)
        dy = r * np.sin(theta)
        x = dx + cen_p[0]
        y = dy + cen_p[1]
        return np.array([x, y]).T

    @staticmethod
    def img_polar_transfrom(img, cen_p):
        img_size = img.shape[0]
        intencities = []

        for r in range(img_size):
            coor = PelletsDetector2.polar_coord_T(np.arange(0, 360, 1), r, cen_p).astype(int)
            if np.any(coor <= 0) or np.any(coor >= img_size - 1):
                break
            intencities.append(img[coor[:, 1], coor[:, 0]])

        return np.array(intencities)

    @staticmethod
    def calculate_trimmed_mean(inten, proportion=0.2):
        return trim_mean(inten, proportion)

    def predict_diameter(self):
        if self.med_loc is None or self.med_rad is None:
            raise ValueError("Medicine detection data missing. Please run process_image() first.")
    
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(3, 3))
        kernel2 = np.ones((6, 6), np.uint8)
        closing_list = []
        inhibition_zone_pixels = []
        inhibition_zone_diam = []

        for i in range(len(self.med_loc)):
            img_polar = self.img_polar_transfrom(self.img_crop, self.med_loc[i])
            img_clahe = clahe.apply(img_polar)
            sharpened = cv2.filter2D(img_clahe, -1, np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]]))

            blurred_image = cv2.GaussianBlur(sharpened, (5, 5), 0)
            blurred_image = median_filter(blurred_image, size=5)
            erosion = cv2.erode(blurred_image, kernel2, iterations=1)
            dilation = cv2.dilate(erosion, kernel2, iterations=1)
            closing = cv2.morphologyEx(dilation, cv2.MORPH_CLOSE, kernel2)

            sharpened = cv2.addWeighted(closing, 1.5, np.zeros(closing.shape, closing.dtype), 0, 0.3)
            normalized = cv2.normalize(sharpened, None, 0, 255, cv2.NORM_MINMAX)
            closing_list.append(normalized.astype(np.uint8))

        for i, img in enumerate(closing_list):
            sorted_img = np.sort(img, axis=0)
            intensity_r = [self.calculate_trimmed_mean(inten) for inten in sorted_img[:440]]
            y = np.array(intensity_r).astype(float) / 255 * 100
            y_mavg = moving_average(y, 3)
            y_mavg[:self.med_rad[0]] = 100

            all_change_points = []
            for x in range(0, 360, 5):
                angle_profile = sorted_img[:, x] / 255 * 100
                angle_y_mavg = moving_average(angle_profile, 3)
                angle_y_mavg[:self.med_rad[0]] = 100

                angle_dy = np.diff(angle_y_mavg)
                angle_dy[:self.med_rad[0] + 20] = np.abs(angle_dy[:self.med_rad[0] + 20])

                threshold = np.mean(moving_average(abs(angle_dy), 3)) / np.std(angle_dy) + 0.45
                angle_change_points = np.arange(0, len(angle_dy), 2)[angle_dy[::2] > threshold]
                all_change_points.extend(angle_change_points)

            img_width = img.shape[0]
            max_height = min(450, img_width)
            filtered_change_points = [cp for cp in all_change_points if cp < max_height]

            bins = np.arange(0, max_height, 5)
            hist, bin_edges = np.histogram(filtered_change_points, bins=72)
            bin_centers = (bin_edges[:-1] + bin_edges[1:]) / 2

            non_zero_bins = np.where(hist > 0)[0]
            if not non_zero_bins.any():
                selected_peak_index = 0
            else:
                first_bar_index = non_zero_bins[0]
                max_bin_index = np.argmax(hist)
                peaks, _ = find_peaks(hist, height=0.2 * np.max(hist))
                peaks_after = [p for p in peaks if p >= first_bar_index + 10]

                if len(peaks) > 5:
                    selected_peak_index = max_bin_index
                else:
                    if first_bar_index <= max_bin_index < first_bar_index + 10:
                        selected_peak_index = max_bin_index if hist[max_bin_index] >= 0.7 * hist[first_bar_index] else first_bar_index
                    else:
                        selected_peak_index = max_bin_index
                    if peaks_after:
                        selected_peak_index = peaks_after[0]

            most_frequent_y_range = bin_centers[first_bar_index] if hist[selected_peak_index] <= 35 else bin_centers[selected_peak_index]
            predict_radius = most_frequent_y_range - self.med_rad[i]
            inhibition_zone_diam.append(round((self.med_rad[i] + predict_radius) * self.scale_factor * 2, 2))
            inhibition_zone_pixels.append(int(self.med_rad[i] + predict_radius))

        self.inhibition_zone_pixels = inhibition_zone_pixels
        self.inhibition_zone_diam = inhibition_zone_diam

        print(f"Inhibition Zone Pixels: {self.inhibition_zone_pixels}")
        print(f"Inhibition Zone Diameter: {self.inhibition_zone_diam}")

@newtest_ns.route('/draw_zones') 
class DrawZones(Resource):
    def post(self):
        try:
            if 'image' not in request.files:
                return {"error": "Image file missing"}, 400
            
            image_file = request.files['image']
            file_bytes = np.frombuffer(image_file.read(), np.uint8)
            original_image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

            if original_image is None:
                return {"error": "Failed to decode image"}, 400
            print(original_image)
            # เรียก process_image ก่อน
            detector = PelletsDetector2()
            result = detector.process_image(original_image)

            # ถ้าไม่มีข้อมูลจากการตรวจยา ให้ return error
            if detector.med_loc is None or detector.med_rad is None:
                return {"error": "Medicine detection data missing. Please ensure clear image and try again."}, 400

            detector.predict_diameter()

            # วาดจุดลงบนภาพ
            for loc, diam in zip(detector.med_loc, detector.inhibition_zone_pixels):
                x, y = int(loc[0]), int(loc[1])
                cv2.circle(original_image, (x, y), int(diam), (0, 255, 0), 3)  # วงเขียว
                cv2.circle(original_image, (x, y), 5, (0, 0, 255), -1)         # จุดแดงกลาง

            _, buffer = cv2.imencode('.png', original_image)
            img_io = BytesIO(buffer.tobytes())
            img_io.seek(0)

            return send_file(img_io, mimetype='image/png')

        except Exception as e:
            return {"error": str(e)}, 500


@newtest_ns.route('/test_info')   
class PostMedData(Resource):
    @jwt_required()
    def post(self):
        try:
            data = request.get_json()
            username = get_jwt_identity()
            
            required_fields = ['testId', 'bacteriaName', 'newDataPoint']
            for field in required_fields:
                if field not in data:
                    return jsonify({'error': f'Missing field: {field}'}), 400
            
            interpretion.test_id = data['testId']
            interpretion.bacteria_name = data['bacteriaName']
            interpretion.username = username
            new_data_points = data['newDataPoint']
            new_arrays = []

            print("data", data)
            print("interpretion.test_id", interpretion.test_id)
            print("interpretion.bacteria_name", interpretion.bacteria_name)
            print("interpretion.username", interpretion.username)
            print("new_data_points", new_data_points)
            
            try:
                print(len(new_data_points))
                for i in range(len(new_data_points)):

                    interpretion.input_antibiotic = str(new_data_points[i][0])
                    interpretion.input_diam = float(round(new_data_points[i][1] * pellets_detector.scale_factor * 2, 2)) 
                    interpretion.input_bacteria = str(interpretion.bacteria_name)
                    print("input_antibiotic : ", interpretion.input_antibiotic)
                    print("input_diam : ", interpretion.input_diam)
                    print("input_bacteria : ", interpretion.input_bacteria)
                    print("-------------------------------------")
                    new_arrays.append(interpretion.callable_zone())
            except Exception as e:
                return jsonify({"error": str(e), "message": "Error when interpreting inhibition zone"}), 500
            
            print("Final response data:", new_arrays)
            return make_response(jsonify(new_arrays), 200)
    
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
def generate_zone_id():
    while True:
        zone_id = random.randint(1000, 9999)
        # Check if zone id already exist in the database if not return generate zone id
        if not InhibitionZone.query.filter_by(zone_id=zone_id).first():
            return zone_id

def get_latest_edit_number(test_id):
    latest_edit = db.session.query(
        db.func.max(InhibitionZoneHistory.number_of_test)
    ).filter(InhibitionZoneHistory.test_id == test_id).scalar()

    return latest_edit if latest_edit is not None else 0

import json
@newtest_ns.route('/add_data')
class AddData(Resource):
    @jwt_required()
    def post(self):
        try:
            # เช็คภาพ
            if 'image' not in request.files:
                return {"error": "Image file missing"}, 400

            image = request.files['image']
            if not image or not allowed_file(image.filename):
                return {"error": "Invalid image file"}, 400

            # รับข้อมูล JSON จาก form field ชื่อ 'data'
            data_json = request.form.get('data')
            if not data_json:
                return {"error": "Missing data"}, 400

            new_data = json.loads(data_json)
            test_id = new_data['testId']
            bacteria_name = new_data['bacteriaName']
            username = new_data['username']
            new_data_points = new_data.get('newDataPoint')
            created_at = new_data.get('createdAt')

            # ตั้งชื่อไฟล์รูปภาพ
            timestamp = int(time.time())
            ext = image.filename.rsplit('.', 1)[1].lower()
            filename = secure_filename(f"{test_id}_{timestamp}.{ext}")
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            image.save(filepath)

            # เตรียมการเขียนข้อมูล
            output_inhibition = []
            output_history = []

            existing_test = ASTtest.query.filter_by(test_id=test_id).first()
            if existing_test:
                existing_test.update(bacteria_name, username)
                existing_test.image_filename = filename
                number_of_edit = get_latest_edit_number(test_id)
                InhibitionZone.query.filter_by(test_id=test_id).delete()
            else:
                existing_test = ASTtest(
                    test_id=test_id,
                    bacteria_name=bacteria_name,
                    username=username,
                    created_at=created_at,
                    image_filename=filename
                )
                db.session.add(existing_test)
                number_of_edit = 0

            for newData in new_data_points:
                antibiotic_name = newData['antibiotic_name']
                inhibition_diam = newData['diameter']
                resistant = newData['resistant']

                inhibition_zone = InhibitionZone(
                    test_id=test_id,
                    antibiotic_name=antibiotic_name,
                    diameter=inhibition_diam,
                    resistant=resistant,
                    username=username,
                    created_at=created_at
                )
                db.session.add(inhibition_zone)

                history_entry = InhibitionZoneHistory(
                    test_id=test_id,
                    number_of_test=number_of_edit + 1,
                    antibiotic_name=antibiotic_name,
                    diameter=inhibition_diam,
                    resistant=resistant,
                    username=username,
                    edit_at=datetime.utcnow()
                )
                db.session.add(history_entry)

                output_inhibition.append(inhibition_zone)
                output_history.append(history_entry)

            db.session.commit()

            return {
                "message": "Data and image saved successfully",
                "image_filename": filename,
                "history_count": len(output_history),
                "zone_count": len(output_inhibition)
            }, 201

        except Exception as e:
            print("Error:", e)
            return {"error": str(e)}, 500


@newtest_ns.route('/med_info')   
class GetMedInfo(Resource):
    def get(self):
        if pellets_detector.med_loc is not None and pellets_detector.med_rad is not None:
            images_data = []
            for img_array in pellets_detector.pellets:
                # Convert the NumPy array to an image
                img = cv2.cvtColor(img_array, cv2.COLOR_GRAY2RGB)
                # Convert the image to a byte array
                _, img_encoded = cv2.imencode('.png', img)
                # Encode the byte array as a base64 string
                img_base64 = base64.b64encode(img_encoded).decode('utf-8')
                # Add the base64 string to the list
                images_data.append(img_base64)
            med_data = [(loc[0], loc[1], diam, images_data) for loc, diam, images_data in zip(pellets_detector.med_loc, pellets_detector.inhibition_zone_pixels, images_data)]
            return (med_data), 200
        else:
            return jsonify({'error': 'Medicine information not available. Please Process an image first.'}), 404
        
        
@newtest_ns.route('/inhibition_history/<test_id>')
class InhibitionZoneHistoryResource(Resource):
    @jwt_required()
    def get(self, test_id):
        try:
            # Query the database for inhibition zone history for this test
            history = InhibitionZoneHistory.query.filter_by(test_id=test_id).all()
            
            if not history:
                return [], 200
                
            history_by_edit = {}
            for h in history:
                if h.number_of_test not in history_by_edit or h.edit_at > history_by_edit[h.number_of_test]["edit_at"]:
                    history_by_edit[h.number_of_test] = {
                        "edit_at": h.edit_at,
                        "data": []
                    }
                history_by_edit[h.number_of_test]["data"].append({
                    "antibiotic_name": h.antibiotic_name,
                    "diameter": h.diameter,
                    "resistant": h.resistant,
                    "username": h.username,
                })
            
            latest_edit = max(history_by_edit.keys())
            latest_data = history_by_edit[latest_edit]["data"]
            
            return latest_data, 200
            
        except Exception as e:
            return {"error": str(e)}, 500  

        
@newtest_ns.route('/get_test_data')
class GetDataByTestID(Resource):
    @newtest_ns.marshal_with(ast_test_model)
    def get(self):
        test = ASTtest.query.all()
        return test
    
    @newtest_ns.marshal_with(ast_test_model)
    @newtest_ns.expect(ast_test_model)
    @jwt_required()
    def post(self):  
        data = request.get_json()
        print("Received data:", data) 
        username = get_jwt_identity()

        new_test = ASTtest(
            test_id=data.get("test_id"),
            bacteria_name=data.get("bacteria"),
            username=username
        )
      
        new_test.save()
        return new_test, 201
       
@newtest_ns.route('/get_test_data_by_Id/<int:test_id>')
class GetDataByTestID(Resource):
    @newtest_ns.marshal_with(ast_test_model)
    def get(self, test_id):
        test = ASTtest.query.get_or_404(test_id)
        return test
    
    @newtest_ns.marshal_with(change_log_model)
    @newtest_ns.expect(change_log_model)
    @jwt_required()  
    def put(self, test_id):
        data = request.get_json()
        username = get_jwt_identity()

        existing_test = ASTtest.query.filter_by(test_id=test_id).first()
        if not existing_test:
            return {'message': 'Test ID not found'}, 404
        
        bacteria = existing_test.bacteria_name

        if 'bacteria' in data and data['bacteria'] != existing_test.bacteria_name:
            existing_test.bacteria_name = data['bacteria']
            new_bacteria = data['bacteria']

            history = TestHistory(
                history_id=None,
                test_id=existing_test.test_id, 
                username=username, 
                old_value=bacteria,
                new_value=new_bacteria
            )
            history.save()
        else:
            new_bacteria = bacteria 
        existing_test.username = username 
        existing_test.save()

        return {
            'test_data': existing_test,
            'history': "Bacteria not updated, no history entry" if new_bacteria == bacteria else history
        }, 200
    
@newtest_ns.route('/get_result_by_testID/<int:test_id>') 
class GetDataByTestID(Resource):
    @newtest_ns.marshal_with({
        'test_data': fields.List(fields.Nested({
            "test_id": fields.Integer(),
            "bacteria_name": fields.String(),
            "username": fields.String(),
            "image_filename": fields.String(),
            "created_at" : fields.DateTime()
            })),
        'inhibition_zones': fields.List(fields.Nested({
            'antibiotic_name': fields.String(),
            'diameter': fields.Float(),
            'resistant': fields.String(),
            "created_at" : fields.DateTime()
        }))
    })
    def get(self, test_id):
        test = ASTtest.query.filter_by(test_id=test_id).all() 
        if not test:
            return {"message": "Test not found"}, 404

        inhibition_zones = InhibitionZone.query.filter_by(test_id=test_id).all()
        if not inhibition_zones:
            inhibition_zones = []
        
        return {
            "test_data": test,
            "inhibition_zones": inhibition_zones
        }
    
    def put(self, test_id):
        data = request.get_json()
        username = get_jwt_identity()

        existing_test = ASTtest.query.filter_by(test_id=test_id).first()
        if not existing_test:
            return {'message': 'Test ID not found'}, 404

        existing_test.bacteria_name = data.get("bacteria", existing_test.bacteria_name)
        existing_test.username = username 

        existing_test.save()
        return existing_test, 200

@newtest_ns.route('/report')
class getReport(Resource):
    def get(self):
        results = db.session.query(
            ASTtest.test_id,
            ASTtest.bacteria_name,
            ASTtest.username,
            InhibitionZone.diameter,
            InhibitionZone.antibiotic_name,
            InhibitionZone.resistant
        ).join(InhibitionZone, ASTtest.test_id == InhibitionZone.test_id).all()

        report_data = []
        for row in results:
            report_data.append({
                'test_id': row.test_id,
                'bacteria_name': row.bacteria_name,
                'username': row.username,
                'diameter': row.diameter,
                'antibiotic_name': row.antibiotic_name,
                'resistant': row.resistant
            })

        return jsonify(report_data)

@newtest_ns.route('/report/test_id')
class getReportByTestId(Resource):
    def get():
        test_id = request.args.get('test_id', type=int)
        if test_id:
            test = ASTtest.query.filter_by(test_id=test_id).first()
            if test:
                return jsonify([zone.to_dict() for zone in test.inhibition_zone_history]), 200
            else:
                return jsonify({"error": "Test ID not found"}), 404
        return jsonify({"error": "Test ID is required"}), 400
    
@newtest_ns.route('/report/username')
class getReportByUsername(Resource):
    def get():
        username = request.args.get('username', type=str)
        if username:
            user_tests = ASTtest.query.filter_by(username=username).all()
            if user_tests:
                return jsonify([test.to_dict() for test in user_tests]), 200
            else:
                return jsonify({"error": "No tests found for this username"}), 404
        return jsonify({"error": "Username is required"}), 400

@newtest_ns.route('/report/date')
class getReportByDate(Resource):
    def get():
        date_str = request.args.get('date', type=str)
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d')
            tests = ASTtest.query.filter(db.func.date(ASTtest.created_at) == date.date()).all()
            if tests:
                return jsonify([test.to_dict() for test in tests]), 200
            else:
                return jsonify({"error": "No tests found for this date"}), 404
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

@newtest_ns.route('/report/antibiotic')
class getReportByAntibiotic(Resource):
    def get(self):
        antibiotic_name = request.args.get('antibiotic_name', type=str)

        if not antibiotic_name:
            return jsonify({"error": "Antibiotic name is required"}), 400
        
        tests = (
            ASTtest.query
            .join(InhibitionZone)
            .filter(InhibitionZone.antibiotic_name == antibiotic_name)
            .distinct() 
            .all()
        )

        if not tests:
            return jsonify({"error": "No tests found for this antibiotic"}), 404

        return jsonify([
            {
                'test_id': test.test_id,
                'bacteria_name': test.bacteria_name,
                'username': test.username,
                'created_at': test.created_at.strftime('%Y-%m-%d'),
                'inhibition_zone_history': [
                    {
                        'antibiotic_name': zone.antibiotic_name,
                        'diameter': zone.diameter,
                        'resistant': zone.resistant,
                        'number_of_test': zone.number_of_test,
                        'username': zone.username
                    } for zone in test.inhibition_zone_history if zone.antibiotic_name == antibiotic_name  # Ensure filtering in history too
                ]
            } for test in tests
        ]), 200


# @newtest_ns.route('/report/search')
# class getSearchReport(Resource):
#     def get(self, *args, **kwargs):
#         print("Query parameters received:", request.args)

#         # Extract query parameters
#         test_id = request.args.get('test_id', type=int)
#         username = request.args.get('username', type=str)
#         date_str = request.args.get('date', type=str)
        
#         query = ASTtest.query
        
#         if test_id:
#             query = query.filter(ASTtest.test_id == test_id)
#         if username:
#             query = query.filter(ASTtest.username == username)
#         if date_str:
#             try:
#                 date = datetime.strptime(date_str, '%Y-%m-%d')
#                 query = query.filter(db.func.date(ASTtest.created_at) == date.date())
#             except ValueError:
#                 return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

#         results = query.all()
        
#         if not results:
#             return jsonify({"error": "No results found"}), 404
        
#         report_data = [{
#             'test_id': test.test_id,
#             'bacteria_name': test.bacteria_name,
#             'created_at': test.created_at.strftime('%Y-%m-%d'),  # Convert datetime to string
#             'inhibition_zone_history': [
#                 {
#                     'number_of_test': zone.number_of_test,
#                     'username' : zone.username,
#                     'antibiotic_name': zone.antibiotic_name,
#                     'diameter': zone.diameter,
#                     'resistant': zone.resistant
#                 } for zone in test.inhibition_zone_history
#             ]
#         } for test in results]

#         return jsonify(report_data)
@newtest_ns.route('/report/search')
class getSearchReport(Resource):
    def get(self):
        print("Query parameters received:", request.args)

        # Extract query parameters
        test_id = request.args.get('test_id', type=int)
        username = request.args.get('username', type=str)
        date_str = request.args.get('date', type=str)
        antibiotic_name = request.args.get('antibiotic_name', type=str)

        # Build dynamic filter conditions
        filters = []
        if test_id:
            filters.append(ASTtest.test_id == test_id)
        if username:
            filters.append(ASTtest.username == username)
        if date_str:
            try:
                date = datetime.strptime(date_str, '%Y-%m-%d')
                filters.append(db.func.date(ASTtest.created_at) == date.date())
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        if antibiotic_name:
            filters.append(InhibitionZone.antibiotic_name == antibiotic_name)

        # Apply filters using SQLAlchemy
        query = ASTtest.query
        if filters:
            query = query.join(InhibitionZone).filter(and_(*filters)).distinct()

        results = query.all()

        if not results:
            return jsonify({"error": "No results found"}), 404

        report_data = [{
            'test_id': test.test_id,
            'bacteria_name': test.bacteria_name,
            'created_at': test.created_at.strftime('%Y-%m-%d'),
            'inhibition_zone_history': [
                {
                    'number_of_test': zone.number_of_test,
                    'username': zone.username,
                    'antibiotic_name': zone.antibiotic_name,
                    'diameter': zone.diameter,
                    'resistant': zone.resistant
                } for zone in test.inhibition_zone_history if not antibiotic_name or zone.antibiotic_name == antibiotic_name
            ]
        } for test in results]

        return jsonify(report_data)

@newtest_ns.route('/report/latest')
class getLatestReport(Resource):
    def get(self):
        print("Query parameters received:", request.args)
        
        query = ASTtest.query
        
        results = query.all()
        
        if not results:
            return jsonify({"error": "No results found"}), 404
        
        report_data = [{
            'test_id': test.test_id,
            'bacteria_name': test.bacteria_name,
            'created_at': test.created_at.strftime('%Y-%m-%d'),  # Convert datetime to string
            'inhibition_zone_history': [
                {
                    'number_of_test': zone.number_of_test,
                    'username' : zone.username,
                    'antibiotic_name': zone.antibiotic_name,
                    'diameter': zone.diameter,
                    'resistant': zone.resistant
                } for zone in test.inhibition_zone_history
            ]
        } for test in results]

        return jsonify(report_data)
'''



import base64
from datetime import datetime
from io import BytesIO
import os
import random
import cv2
from flask_restx import Resource, Namespace, fields
from flask import logging, make_response, request, jsonify, send_file
import numpy as np
import pandas as pd
import psycopg2
from model import ASTtest, InhibitionZone, InhibitionZoneHistory, TestHistory, User
from flask_jwt_extended import (
    get_jwt_identity,
    jwt_required,
    decode_token,
    verify_jwt_in_request,
)
from PIL import Image
from exts import db
from werkzeug.utils import secure_filename
import PlateDetector
import MedicineDetector
from scipy.stats import trim_mean
from util import resize, moving_average, adjust_brightness
from scipy.ndimage import median_filter
from scipy.signal import find_peaks
import time
from sqlalchemy import and_
import threading
_thread_local = threading.local()

UPLOAD_FOLDER = "uploads"  # โฟลเดอร์สำหรับเก็บภาพ
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def get_latest_edit_number(test_id):
    # ฟังก์ชันสมมุติ ถ้ายังไม่มี สามารถเปลี่ยนเป็น query count ได้
    history = (
        InhibitionZoneHistory.query.filter_by(test_id=test_id)
        .order_by(InhibitionZoneHistory.number_of_test.desc())
        .first()
    )
    return history.number_of_test if history else 0


class PelletsDetector:
    def __init__(self):
        self.img_crop = None
        self.med_circles = None
        self.plate_circle = None
        self.plate_radius = None
        self.scale_factor = None
        self.med_loc = None
        self.med_rad = None
        self.inhibition_zone_diam = None
        self.pellets = None

    def process_image(self, image_path):
        if image_path is not None:
            img = image_path
            # Convert to grayscale
            # img = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)
            # img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

            img = PlateDetector.resize(img, 2000)
            try:
                self.plate_circle = PlateDetector.detect_plate(img)
                self.plate_radius = self.plate_circle[0, 0, 2]
            except Exception as e:
                print("PlateDetector Error", e)
                return str(e)

            try:
                self.img_crop = PlateDetector.circle_crop(
                    img, self.plate_circle, pad=0, normalize_size=True
                )
                self.med_circles = MedicineDetector.detect(self.img_crop, pad=0)
                plate_radius_real = 6.35 / 2
                self.scale_factor = plate_radius_real / np.mean(
                    self.med_circles[0, :, 2]
                )

                self.med_loc = [
                    (float(self.med_circles[0, i, 0]), float(self.med_circles[0, i, 1]))
                    for i in range(len(self.med_circles[0]))
                ]
                self.med_rad = [
                    int(np.floor(self.med_circles[0, i, -1]))
                    for i in range(len(self.med_circles[0]))
                ]
                self.pellets = [
                    PlateDetector.circle_crop(
                        self.img_crop,
                        self.med_circles[0][i].reshape((1, 1, -1)),
                        pad=150,
                        normalize_size=False,
                    )
                    for i in range(len(self.med_circles[0]))
                ]
            except Exception as e:
                print("MedicineDetector Error", e)
                return str(e)

            return self.img_crop, self.med_loc # add return med_loc
        else:
            return "image not found"

    def polar_coord_T(theta, r, cen_p: tuple) -> tuple:
        """transform polar coordinates to x ,y coordinates
        cen_p : a center point is the point(x,y) where r=0
        """

        # transfrom degree to radians.
        theta = 2 * np.pi * theta / 360

        dx = r * np.cos(theta)
        dy = r * np.sin(theta)

        x = dx + cen_p[0]
        y = dy + cen_p[1]

        return np.array([x, y]).T

    def img_polar_transfrom(img, cen_p):
        """transform image to polar coordinates"""
        img_size = img.shape[0]
        intencities = []

        for r in range(0, img_size):
            coor = PelletsDetector.polar_coord_T(np.arange(0, 360, 1), r, cen_p).astype(
                int
            )
            intencity = img[coor[:, 1], coor[:, 0]]
            intencities.append(intencity)

            # exit if cordinate out of image size
            if np.any(coor <= 0) or np.any(coor >= img_size - 1):
                break

        return np.array(intencities)

    def calculate_trimmed_mean(inten, proportion=0.2):
        """calculate trimmed mean of each ranged"""
        return trim_mean(inten, proportion)

    def predict_diameter(self):
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(3, 3))
        kernel2 = np.ones((6, 6), np.uint8)
        img_polar = []
        global closing_list
        closing_list = []
        inhibition_zone_pixels = []
        inhibition_zone_diam = []

        for i in range(len(self.med_loc)):
            img_polar = PelletsDetector.img_polar_transfrom(
                self.img_crop, self.med_loc[i]
            )
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(3, 3))
            img_clahe = clahe.apply(img_polar)
            sharpened = cv2.filter2D(
                img_clahe, -1, np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
            )

            blurred_image = cv2.GaussianBlur(sharpened, (5, 5), 0)
            blurred_image = median_filter(blurred_image, size=5)
            erosion = cv2.erode(blurred_image, kernel2, iterations=1)
            dilation = cv2.dilate(erosion, kernel2, iterations=1)
            closing = cv2.morphologyEx(dilation, cv2.MORPH_CLOSE, kernel2)

            brightness = 0.3
            contrast = 1.5
            sharpened = cv2.addWeighted(
                closing, contrast, np.zeros(closing.shape, closing.dtype), 0, brightness
            )
            normalized = cv2.normalize(sharpened, None, 0, 255, cv2.NORM_MINMAX)
            closing_list.append(normalized.astype(np.uint8))

        intensity_r = []
        global_closing_list_sort = closing_list

        for i in range(len(self.med_loc)):
            global_closing_list_sort[i] = np.sort(closing_list[i])
        for i in range(len(self.med_loc)):
            intensity_r.append(
                [
                    PelletsDetector.calculate_trimmed_mean(inten)
                    for inten in global_closing_list_sort[i][0:440]
                ]
            )

        for i in range(len(self.med_loc)):
            y = np.array(intensity_r[i]).astype(float)
            y = y / 255 * 100
            y_mavg = moving_average(y, 3)
            for r in range(self.med_rad[0]):
                y_mavg[r] = 100

            all_change_points = []

            for x in range(0, 360, 5):
                angle_profile = global_closing_list_sort[i][:, x]
                angle_profile = angle_profile / 255 * 100

                angle_y_mavg = moving_average(angle_profile, 3)
                for r in range(self.med_rad[0]):
                    angle_y_mavg[r] = 100

                angle_dy = np.diff(angle_y_mavg)
                angle_dy[: self.med_rad[0] + 20] = np.abs(
                    angle_dy[: self.med_rad[0] + 20]
                )

                threshold = (
                    np.mean(moving_average(abs(angle_dy), 3)) / np.std(angle_dy) + 0.45
                )
                angle_change_points = np.arange(0, len(angle_dy), 2)[
                    (angle_dy)[::2] > threshold
                ]
                all_change_points.extend(angle_change_points)

            img_width = closing_list[i].shape[0]
            max_height = 450 if img_width > 450 else img_width

            filtered_change_points = [cp for cp in all_change_points if cp < max_height]

            bins = np.arange(0, max_height, 5)
            hist, bin_edges = np.histogram(filtered_change_points, bins=72)
            bin_centers = (bin_edges[:-1] + bin_edges[1:]) / 2

            non_zero_bins = np.where(hist > 0)[0]

            if len(non_zero_bins) == 0:
                selected_peak_index = 0
            else:
                first_bar_index = non_zero_bins[0]
                max_bin_index = np.argmax(hist)

                peaks, _ = find_peaks(hist, height=0.2 * np.max(hist))
                peaks_after = [p for p in peaks if p >= first_bar_index + 10]

                if len(peaks) > 5:
                    selected_peak_index = np.argmax(hist)
                else:
                    if first_bar_index <= max_bin_index < first_bar_index + 10:
                        if hist[max_bin_index] >= 0.7 * hist[first_bar_index]:
                            selected_peak_index = max_bin_index
                        else:
                            selected_peak_index = first_bar_index
                    else:
                        selected_peak_index = max_bin_index

                    if peaks_after:
                        selected_peak_index = peaks_after[0]

            if hist[selected_peak_index] <= 35:
                most_frequent_y_range = bin_centers[first_bar_index]
            else:
                most_frequent_y_range = bin_centers[selected_peak_index]

            predict_radius = most_frequent_y_range - self.med_rad[i]
            inhibition_zone_diam.append(
                round((self.med_rad[i] + predict_radius) * self.scale_factor * 2, 2)
            )
            inhibition_zone_pixels.append(int(self.med_rad[i] + predict_radius))

        self.inhibition_zone_pixels = inhibition_zone_pixels
        self.inhibition_zone_diam = inhibition_zone_diam
        print(f"Inhibition Zone Pixels: {self.inhibition_zone_pixels}")
        print(f"Inhibition Zone Diameter: {self.inhibition_zone_diam}")


class Interpretator:
    def __init__(self):
        self.test_id = None
        self.bacteria_name = None
        self.username = None
        self.new_data_point = None
        self.input_antibiotic = None
        self.input_diam = None
        self.input_bacteria = None
        self.current_med_locations = None

    def callable_zone(self):
        df = pd.read_csv(r"annotion.csv")
        s = df["S"]
        i = df["I"]
        r = df["R"]
        df = df.drop(columns=["SDD"])

        input_antibiotic = self.input_antibiotic
        input_diam = self.input_diam
        input_bacteria = self.input_bacteria

        try:
            med_index = df.loc[
                (df["Antimicrobial Agent"] == input_antibiotic)
                & (df["Bacteria"] == input_bacteria)
            ].index.astype(int)[0]
            print(
                f"Searching for: {input_antibiotic} and {input_bacteria} in DataFrame"
            )
        except IndexError:
            return f"{input_antibiotic}", " : ", input_diam

        if pd.isna(s[med_index]) or pd.isna(i[med_index]) or pd.isna(r[med_index]):
            return "Data is NaN for the given index", "", input_diam

        condition_s = s[med_index]  # Extracting the condition from the list
        ass = i[med_index].split()
        condition_i = ass[0] + " and input_antibiotic " + ass[1]
        condition_r = r[1]

        print(f"Evaluating: {str(input_diam)} {condition_s}")

        if eval(str(input_diam) + condition_s):
            print("Condition is S")
            return [input_antibiotic, "(S) ", input_diam, " mm "]

        elif eval(str(input_diam) + condition_i):
            print("Condition is I")
            return [input_antibiotic, "(I) ", input_diam, " mm "]

        elif eval(str(input_diam) + condition_r):
            print("Condition is R")
            return [input_antibiotic, "(R) ", input_diam, " mm "]

        else:
            return ["Error", f"Antimicrobial or Bacteria not found {input_diam}", None]


newtest_ns = Namespace("ASTtest", description="A namespace for Test")
pellets_detector = PelletsDetector()
interpretion = Interpretator()

basedir = os.path.abspath(os.path.dirname(__file__))
uploads_path = os.path.join(basedir, "/uploads")

# Model serializer for AST test
ast_test_model = newtest_ns.model(
    "ASTtest",
    {
        "test_id": fields.Integer(),
        "bacteria_name": fields.String(),
        "username": fields.String(),
        "created_at": fields.DateTime(),
    },
)
change_log_model = newtest_ns.model(
    "TestHistory",
    {
        "history_id": fields.Integer(),
        "test_id": fields.Integer(),
        "username": fields.String(),
        "old_value": fields.String(),
        "new_value": fields.String(),
        "edit_at": fields.DateTime(),
    },
)
inhibition_zone_model = newtest_ns.model(
    "InhibitionZone",
    {
        "zone_id": fields.Integer(),
        "test_id": fields.Integer(),
        "antibiotic_name": fields.String(),
        "diameter": fields.Float(),
        "resistant": fields.String(),
        "username": fields.String(),
        "created_at": fields.DateTime(),
    },
)
inhibition_zone_history_model = newtest_ns.model(
    "InhibitionZoneHistory",
    {
        "history_id": fields.Integer(),
        "test_id": fields.Integer(),
        "number_of_test": fields.Integer(),
        "antibiotic_name": fields.String(),
        "diameter": fields.Float(),
        "resistant": fields.String(),
        "username": fields.String(),
        "edit_at": fields.DateTime(),
    },
)

import logging

logging.basicConfig(level=logging.DEBUG)


@newtest_ns.route("/process_image")
class ProcessImage(Resource):
    def post(self):
        try:
            # Check if the 'image' field exists in the uploaded files
            if "image" not in request.files:
                return f"Error No file upload {str(e)}", 400

            image_file = request.files["image"]

            # Check if the file is empty
            if image_file.filename == "":
                return f"Error no select file {str(e)}", 400

            # Read the file content as bytes and process the image
            file_bytes = np.frombuffer(image_file.read(), np.uint8)
            image = cv2.imdecode(file_bytes, cv2.IMREAD_GRAYSCALE)

            if image is None:
                return f"Error while decode image {str(e)}", 400

            try:
                image_array, med_loc = pellets_detector.process_image(image)
                
                med_locations = [[float(x), float(y)] for x, y in med_loc]
                print("*************************************")
                print("Medicine locations:", med_locations)
                print("*************************************")
                # Store in thread-local storage
                _thread_local.med_locations = med_locations
                # Also store in pellets_detector as a class variable
                pellets_detector.current_med_locations = med_locations
                
            except Exception as e:
                error_message = str(e)
                logging.error(f"Error during image processing: {error_message}")
                return f"Error while process image {str(e)}", 500

            # Convert the processed numpy array back to an image file
            img_io = BytesIO()
            Image.fromarray(image_array).save(img_io, "PNG")
            img_io.seek(0)

            try:
                pellets_detector.predict_diameter()
            except Exception as e:
                # Convert error to a string before returning
                error_message = str(e)
                logging.error(f"Error during prediction: {error_message}")
                return f"Error while process image {str(e)}", 500

            # return send_file(img_io, mimetype="image/png")
            response = send_file(img_io, mimetype="image/png")
            response.headers['X-Med-Locations'] = json.dumps(med_locations)
            return response

        except Exception as e:
            error_message = str(e)
            logging.error(f"Unexpected error: {error_message}")
            return f"Error while import image {str(e)}", 500

@newtest_ns.route("/test_info")
class PostMedData(Resource):
    @jwt_required()
    def post(self):
        try:
            data = request.get_json()
            username = get_jwt_identity()
            #med_locations = getattr(pellets_detector, 'current_med_locations', [])
            med_locations = getattr(_thread_local, 'med_locations', [])
            if not med_locations and hasattr(pellets_detector, 'current_med_locations'):
                med_locations = pellets_detector.current_med_locations

            required_fields = ["testId", "bacteriaName", "newDataPoint"]
            for field in required_fields:
                if field not in data:
                    return jsonify({"error": f"Missing field: {field}"}), 400

            interpretion.test_id = data["testId"]
            interpretion.bacteria_name = data["bacteriaName"]
            interpretion.username = username
            new_data_points = data["newDataPoint"]
            new_arrays = []

            print("data", data)
            print("interpretion.test_id", interpretion.test_id)
            print("interpretion.bacteria_name", interpretion.bacteria_name)
            print("interpretion.username", interpretion.username)
            print("new_data_points", new_data_points)

            try:
                print(len(new_data_points))
                for i in range(len(new_data_points)):

                    interpretion.input_antibiotic = str(new_data_points[i][0])
                    interpretion.input_diam = float(
                        round(
                            new_data_points[i][1] * pellets_detector.scale_factor * 2, 2
                        )
                    )
                    interpretion.input_bacteria = str(interpretion.bacteria_name)
                    print("input_antibiotic : ", interpretion.input_antibiotic)
                    print("input_diam : ", interpretion.input_diam)
                    print("input_bacteria : ", interpretion.input_bacteria)
                    print("-------------------------------------")
                    new_arrays.append(interpretion.callable_zone())
            except Exception as e:
                return (
                    jsonify(
                        {
                            "error": str(e),
                            "message": "Error when interpreting inhibition zone",
                        }
                    ),
                    500,
                )
        
            #print("Final response data:", new_arrays)
            
            response_data = {
                "antibioticData": new_arrays,
                "medLocations": med_locations
            }
            print("Final response data:", response_data)
            return make_response(jsonify(response_data), 200)
            #return make_response(jsonify(new_arrays), 200)

        except Exception as e:
            return jsonify({"error": str(e)}), 500


def generate_zone_id():
    while True:
        zone_id = random.randint(1000, 9999)
        # Check if zone id already exist in the database if not return generate zone id
        if not InhibitionZone.query.filter_by(zone_id=zone_id).first():
            return zone_id


def get_latest_edit_number(test_id):
    latest_edit = (
        db.session.query(db.func.max(InhibitionZoneHistory.number_of_test))
        .filter(InhibitionZoneHistory.test_id == test_id)
        .scalar()
    )

    return latest_edit if latest_edit is not None else 0


import json


# เเก้ไข
@newtest_ns.route("/add_data")
class AddData(Resource):
    @jwt_required()
    def post(self):
        try:
            # เช็คภาพ
            if "image" not in request.files:
                return {"error": "Image file missing"}, 400

            image = request.files["image"]
            if not image or not allowed_file(image.filename):
                return {"error": "Invalid image file"}, 400

            # รับข้อมูล JSON จาก form field ชื่อ 'data'
            data_json = request.form.get("data")
            if not data_json:
                return {"error": "Missing data"}, 400

            new_data = json.loads(data_json)
            test_id = new_data["testId"]
            bacteria_name = new_data["bacteriaName"]
            username = new_data["username"]
            new_data_points = new_data.get("newDataPoint")
            created_at = new_data.get("createdAt")

            # ตั้งชื่อไฟล์รูปภาพ
            timestamp = int(time.time())
            ext = image.filename.rsplit(".", 1)[1].lower()
            filename = secure_filename(f"{test_id}_{timestamp}.{ext}")
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            image.save(filepath)

            # เตรียมการเขียนข้อมูล
            output_inhibition = []
            output_history = []

            existing_test = ASTtest.query.filter_by(test_id=test_id).first()
            if existing_test:
                existing_test.update(bacteria_name, username)
                existing_test.image_filename = filename
                number_of_edit = get_latest_edit_number(test_id)
                InhibitionZone.query.filter_by(test_id=test_id).delete()
            else:
                existing_test = ASTtest(
                    test_id=test_id,
                    bacteria_name=bacteria_name,
                    username=username,
                    created_at=created_at,
                    image_filename=filename,
                )
                db.session.add(existing_test)
                number_of_edit = 0

            for newData in new_data_points:
                antibiotic_name = newData["antibiotic_name"]
                inhibition_diam = newData["diameter"]
                inhibition_pixels = newData["pixels"]
                resistant = newData["resistant"]

                inhibition_zone = InhibitionZone(
                    test_id=test_id,
                    antibiotic_name=antibiotic_name,
                    diameter=inhibition_diam,
                    pixel=inhibition_pixels,
                    resistant=resistant,
                    username=username,
                    created_at=datetime.utcnow(),
                )
                db.session.add(inhibition_zone)

                history_entry = InhibitionZoneHistory(
                    test_id=test_id,
                    number_of_test=number_of_edit + 1,
                    antibiotic_name=antibiotic_name,
                    diameter=inhibition_diam,
                    resistant=resistant,
                    username=username,
                    edit_at=datetime.utcnow(),
                )
                db.session.add(history_entry)

                output_inhibition.append(inhibition_zone)
                output_history.append(history_entry)

            db.session.commit()

            return {
                "message": "Data and image saved successfully",
                "image_filename": filename,
                "history_count": len(output_history),
                "zone_count": len(output_inhibition),
            }, 201

        except Exception as e:
            print("Error:", e)
            return {"error": str(e)}, 500


@newtest_ns.route("/med_info")
class GetMedInfo(Resource):
    def get(self):
        if (
            pellets_detector.med_loc is not None
            and pellets_detector.med_rad is not None
        ):
            images_data = []
            for img_array in pellets_detector.pellets:
                # Convert the NumPy array to an image
                img = cv2.cvtColor(img_array, cv2.COLOR_GRAY2RGB)
                # Convert the image to a byte array
                _, img_encoded = cv2.imencode(".png", img)
                # Encode the byte array as a base64 string
                img_base64 = base64.b64encode(img_encoded).decode("utf-8")
                # Add the base64 string to the list
                images_data.append(img_base64)
            med_data = [
                (loc[0], loc[1], diam, images_data)
                for loc, diam, images_data in zip(
                    pellets_detector.med_loc,
                    pellets_detector.inhibition_zone_pixels,
                    images_data,
                )
            ]
            return (med_data), 200
        else:
            return (
                jsonify(
                    {
                        "error": "Medicine information not available. Please Process an image first."
                    }
                ),
                404,
            )


@newtest_ns.route("/inhibition_history/<test_id>")
class InhibitionZoneHistoryResource(Resource):
    @jwt_required()
    def get(self, test_id):
        try:
            # Query the database for inhibition zone history for this test
            history = InhibitionZoneHistory.query.filter_by(test_id=test_id).all()

            if not history:
                return [], 200

            history_by_edit = {}
            for h in history:
                if (
                    h.number_of_test not in history_by_edit
                    or h.edit_at > history_by_edit[h.number_of_test]["edit_at"]
                ):
                    history_by_edit[h.number_of_test] = {
                        "edit_at": h.edit_at,
                        "data": [],
                    }
                history_by_edit[h.number_of_test]["data"].append(
                    {
                        "antibiotic_name": h.antibiotic_name,
                        "diameter": h.diameter,
                        "resistant": h.resistant,
                        "username": h.username,
                    }
                )

            latest_edit = max(history_by_edit.keys())
            latest_data = history_by_edit[latest_edit]["data"]

            return latest_data, 200

        except Exception as e:
            return {"error": str(e)}, 500


# เเก้ไข
@newtest_ns.route("/inhibition/<test_id>")
class InhibitionZoneHistoryResource(Resource):
    @jwt_required()
    def get(self, test_id):
        try:
            history = InhibitionZone.query.filter_by(test_id=test_id).all()
            result = []
            for item in history:
                result.append(
                    {
                        "zone_id": item.zone_id,
                        "antibiotic_name": item.antibiotic_name,
                        "diameter": item.diameter,
                        "pixel": item.pixel,
                        "resistant": item.resistant,
                        "username": item.username,
                        "created_at": (
                            item.created_at.isoformat() if item.created_at else None
                        ),
                    }
                )
            return result, 200
        except Exception as e:
            return {"error": str(e)}, 500


@newtest_ns.route("/get_test_data")
class GetDataByTestID(Resource):
    @newtest_ns.marshal_with(ast_test_model)
    def get(self):
        test = ASTtest.query.all()
        return test

    @newtest_ns.marshal_with(ast_test_model)
    @newtest_ns.expect(ast_test_model)
    @jwt_required()
    def post(self):
        data = request.get_json()
        print("Received data:", data)
        username = get_jwt_identity()

        # เช็ก test_id ซ้ำ
        existing_test = ASTtest.query.filter_by(test_id=data.get("test_id")).first()
        if existing_test:
            return {"message": "test_id ซ้ำ"}, 400  # 400 Bad Request

        # ถ้าไม่ซ้ำ สร้างข้อมูลใหม่
        new_test = ASTtest(
            test_id=data.get("test_id"),
            bacteria_name=data.get("bacteria"),
            username=username,
        )

        new_test.save()
        return new_test, 201


@newtest_ns.route("/get_test_data_by_Id/<int:test_id>")
class GetDataByTestID(Resource):
    @newtest_ns.marshal_with(ast_test_model)
    def get(self, test_id):
        test = ASTtest.query.get_or_404(test_id)
        return test

    @newtest_ns.marshal_with(change_log_model)
    @newtest_ns.expect(change_log_model)
    @jwt_required()
    def put(self, test_id):
        data = request.get_json()
        username = get_jwt_identity()

        existing_test = ASTtest.query.filter_by(test_id=test_id).first()
        if not existing_test:
            return {"message": "Test ID not found"}, 404

        bacteria = existing_test.bacteria_name

        if "bacteria" in data and data["bacteria"] != existing_test.bacteria_name:
            existing_test.bacteria_name = data["bacteria"]
            new_bacteria = data["bacteria"]

            history = TestHistory(
                history_id=None,
                test_id=existing_test.test_id,
                username=username,
                old_value=bacteria,
                new_value=new_bacteria,
            )
            history.save()
        else:
            new_bacteria = bacteria
        existing_test.username = username
        existing_test.save()

        return {
            "test_data": existing_test,
            "history": (
                "Bacteria not updated, no history entry"
                if new_bacteria == bacteria
                else history
            ),
        }, 200


@newtest_ns.route("/get_result_by_testID/<int:test_id>")
class GetDataByTestID(Resource):
    @newtest_ns.marshal_with(
        {
            "test_data": fields.List(
                fields.Nested(
                    {
                        "test_id": fields.Integer(),
                        "bacteria_name": fields.String(),
                        "username": fields.String(),
                        "image_filename": fields.String(),
                        "created_at": fields.DateTime(),
                    }
                )
            ),
            "inhibition_zones": fields.List(
                fields.Nested(
                    {
                        "antibiotic_name": fields.String(),
                        "diameter": fields.Float(),
                        "resistant": fields.String(),
                        "created_at": fields.DateTime(),
                    }
                )
            ),
        }
    )
    def get(self, test_id):
        test = ASTtest.query.filter_by(test_id=test_id).all()
        if not test:
            return {"message": "Test not found"}, 404

        inhibition_zones = InhibitionZone.query.filter_by(test_id=test_id).all()
        if not inhibition_zones:
            inhibition_zones = []

        return {"test_data": test, "inhibition_zones": inhibition_zones}

    def put(self, test_id):
        data = request.get_json()
        username = get_jwt_identity()

        existing_test = ASTtest.query.filter_by(test_id=test_id).first()
        if not existing_test:
            return {"message": "Test ID not found"}, 404

        existing_test.bacteria_name = data.get("bacteria", existing_test.bacteria_name)
        existing_test.username = username

        existing_test.save()
        return existing_test, 200


@newtest_ns.route("/report")
class getReport(Resource):
    def get(self):
        results = (
            db.session.query(
                ASTtest.test_id,
                ASTtest.bacteria_name,
                ASTtest.username,
                InhibitionZone.diameter,
                InhibitionZone.antibiotic_name,
                InhibitionZone.resistant,
            )
            .join(InhibitionZone, ASTtest.test_id == InhibitionZone.test_id)
            .all()
        )

        report_data = []
        for row in results:
            report_data.append(
                {
                    "test_id": row.test_id,
                    "bacteria_name": row.bacteria_name,
                    "username": row.username,
                    "diameter": row.diameter,
                    "antibiotic_name": row.antibiotic_name,
                    "resistant": row.resistant,
                }
            )

        return jsonify(report_data)


@newtest_ns.route("/report/test_id")
class getReportByTestId(Resource):
    def get():
        test_id = request.args.get("test_id", type=int)
        if test_id:
            test = ASTtest.query.filter_by(test_id=test_id).first()
            if test:
                return (
                    jsonify([zone.to_dict() for zone in test.inhibition_zone_history]),
                    200,
                )
            else:
                return jsonify({"error": "Test ID not found"}), 404
        return jsonify({"error": "Test ID is required"}), 400


@newtest_ns.route("/report/username")
class getReportByUsername(Resource):
    def get():
        username = request.args.get("username", type=str)
        if username:
            user_tests = ASTtest.query.filter_by(username=username).all()
            if user_tests:
                return jsonify([test.to_dict() for test in user_tests]), 200
            else:
                return jsonify({"error": "No tests found for this username"}), 404
        return jsonify({"error": "Username is required"}), 400


@newtest_ns.route("/report/date")
class getReportByDate(Resource):
    def get():
        date_str = request.args.get("date", type=str)
        try:
            date = datetime.strptime(date_str, "%Y-%m-%d")
            tests = ASTtest.query.filter(
                db.func.date(ASTtest.created_at) == date.date()
            ).all()
            if tests:
                return jsonify([test.to_dict() for test in tests]), 200
            else:
                return jsonify({"error": "No tests found for this date"}), 404
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400


@newtest_ns.route("/report/antibiotic")
class getReportByAntibiotic(Resource):
    def get(self):
        antibiotic_name = request.args.get("antibiotic_name", type=str)

        if not antibiotic_name:
            return jsonify({"error": "Antibiotic name is required"}), 400

        tests = (
            ASTtest.query.join(InhibitionZone)
            .filter(InhibitionZone.antibiotic_name == antibiotic_name)
            .distinct()
            .all()
        )

        if not tests:
            return jsonify({"error": "No tests found for this antibiotic"}), 404

        return (
            jsonify(
                [
                    {
                        "test_id": test.test_id,
                        "bacteria_name": test.bacteria_name,
                        "username": test.username,
                        "created_at": test.created_at.strftime("%Y-%m-%d"),
                        "inhibition_zone_history": [
                            {
                                "antibiotic_name": zone.antibiotic_name,
                                "diameter": zone.diameter,
                                "resistant": zone.resistant,
                                "number_of_test": zone.number_of_test,
                                "username": zone.username,
                            }
                            for zone in test.inhibition_zone_history
                            if zone.antibiotic_name
                            == antibiotic_name  # Ensure filtering in history too
                        ],
                    }
                    for test in tests
                ]
            ),
            200,
        )


# @newtest_ns.route('/report/search')
# class getSearchReport(Resource):
#     def get(self, *args, **kwargs):
#         print("Query parameters received:", request.args)

#         # Extract query parameters
#         test_id = request.args.get('test_id', type=int)
#         username = request.args.get('username', type=str)
#         date_str = request.args.get('date', type=str)

#         query = ASTtest.query

#         if test_id:
#             query = query.filter(ASTtest.test_id == test_id)
#         if username:
#             query = query.filter(ASTtest.username == username)
#         if date_str:
#             try:
#                 date = datetime.strptime(date_str, '%Y-%m-%d')
#                 query = query.filter(db.func.date(ASTtest.created_at) == date.date())
#             except ValueError:
#                 return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

#         results = query.all()

#         if not results:
#             return jsonify({"error": "No results found"}), 404

#         report_data = [{
#             'test_id': test.test_id,
#             'bacteria_name': test.bacteria_name,
#             'created_at': test.created_at.strftime('%Y-%m-%d'),  # Convert datetime to string
#             'inhibition_zone_history': [
#                 {
#                     'number_of_test': zone.number_of_test,
#                     'username' : zone.username,
#                     'antibiotic_name': zone.antibiotic_name,
#                     'diameter': zone.diameter,
#                     'resistant': zone.resistant
#                 } for zone in test.inhibition_zone_history
#             ]
#         } for test in results]


#         return jsonify(report_data)
@newtest_ns.route("/report/search")
class getSearchReport(Resource):
    def get(self):
        print("Query parameters received:", request.args)

        # Extract query parameters
        test_id = request.args.get("test_id", type=int)
        username = request.args.get("username", type=str)
        date_str = request.args.get("date", type=str)
        antibiotic_name = request.args.get("antibiotic_name", type=str)

        # Build dynamic filter conditions
        filters = []
        if test_id:
            filters.append(ASTtest.test_id == test_id)
        if username:
            filters.append(ASTtest.username == username)
        if date_str:
            try:
                date = datetime.strptime(date_str, "%Y-%m-%d")
                filters.append(db.func.date(ASTtest.created_at) == date.date())
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        if antibiotic_name:
            filters.append(InhibitionZone.antibiotic_name == antibiotic_name)

        # Apply filters using SQLAlchemy
        query = ASTtest.query
        if filters:
            query = query.join(InhibitionZone).filter(and_(*filters)).distinct()

        results = query.all()

        if not results:
            return jsonify({"error": "No results found"}), 404

        report_data = [
            {
                "test_id": test.test_id,
                "bacteria_name": test.bacteria_name,
                "created_at": test.created_at.strftime("%Y-%m-%d"),
                "inhibition_zone_history": [
                    {
                        "number_of_test": zone.number_of_test,
                        "username": zone.username,
                        "antibiotic_name": zone.antibiotic_name,
                        "diameter": zone.diameter,
                        "resistant": zone.resistant,
                    }
                    for zone in test.inhibition_zone_history
                    if not antibiotic_name or zone.antibiotic_name == antibiotic_name
                ],
            }
            for test in results
        ]

        return jsonify(report_data)


@newtest_ns.route("/report/latest")
class getLatestReport(Resource):
    def get(self):
        print("Query parameters received:", request.args)

        query = ASTtest.query

        results = query.all()

        if not results:
            return jsonify({"error": "No results found"}), 404

        report_data = [
            {
                "test_id": test.test_id,
                "bacteria_name": test.bacteria_name,
                "created_at": test.created_at.strftime(
                    "%Y-%m-%d"
                ),  # Convert datetime to string
                "inhibition_zone_history": [
                    {
                        "number_of_test": zone.number_of_test,
                        "username": zone.username,
                        "antibiotic_name": zone.antibiotic_name,
                        "diameter": zone.diameter,
                        "resistant": zone.resistant,
                    }
                    for zone in test.inhibition_zone_history
                ],
            }
            for test in results
        ]

        return jsonify(report_data)
    
    
    
    
    
@newtest_ns.route('/medicine-locations/<int:test_id>')
class getMedLoc(Resource):
    def get(testId):
        try:
            test_data = ASTtest.query.filter_by(test_id=testId).first()

            if not test_data:
                return jsonify({"message": "Test data not found"}), 404

            return jsonify({
                'med_loc': test_data.medicine_loc
            })
        
        except Exception as e:
            print('Error fetching medicine locations:', e)
            return jsonify({"message": "Server error"}), 500
        
        
@newtest_ns.route("/get_medicine_locations")
class GetMedicineLocations(Resource):
    def get(self):
        try:
            # Try to get medicine locations from thread-local storage
            med_locations = getattr(_thread_local, 'med_locations', [])
            
            # If not found, try to get from pellets_detector
            if not med_locations and hasattr(pellets_detector, 'current_med_locations'):
                med_locations = pellets_detector.current_med_locations
                
            return jsonify({"medLocations": med_locations})
        except Exception as e:
            return jsonify({"error": str(e), "medLocations": []}), 500
