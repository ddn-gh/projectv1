import cv2
from matplotlib import pyplot as plt
import pandas as pd
import PlateDetector
import MedicineDetector
import numpy as np
from scipy.stats import trim_mean
from util import resize, moving_average, adjust_brightness
from scipy.ndimage import median_filter
from scipy.signal import find_peaks , savgol_filter
from scipy.stats import trim_mean
from scipy.ndimage import gaussian_filter1d
from scipy.interpolate import interp1d
from decimal import Decimal, ROUND_HALF_UP


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
        self.most_frequent_y_range = None
        
    def process_image(self, image_path):
        if image_path is not None:
            img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
            
            img = PlateDetector.resize(img, 2000)

        try:
            self.plate_circle = PlateDetector.detect_plate(img)
            if self.plate_circle is not None:
                print("Plate circle shape:", self.plate_circle.shape)

                if len(self.plate_circle.shape) == 1:  # 1D array (single circle)
                    self.plate_radius = self.plate_circle[2]  # Radius is the 3rd element in the array
                elif len(self.plate_circle.shape) == 2:  # 2D array (multiple circles)
                    self.plate_radius = self.plate_circle[0, 2]  # Radius of the first circle
            else:
                print("No plate detected.")
        except Exception as e:
            print('PlateDetector Error',e)
            
        # try:
        #     self.img_crop = PlateDetector.circle_crop(img, self.plate_circle)
        #     self.med_circles = MedicineDetector.detect(self.img_crop, pad=0)
        #     plate_radius_real = 6.35 / 2
        #     #self.scale_factor = plate_radius_real / np.mean(self.med_circles[0, :, 2])
        #     #self.scale_factor = 6.35 / (2 * self.med_rad[i])
        #     # Auto-fix scale factor if any inhibition zone equals the medicine radius
        #     for i in range(len(self.med_rad)):
        #         # If total diameter in pixels is exactly 2 * med_rad[i], it means no zone => real diameter is 6.35 mm
        #         if self.inhibition_zone_pixels[i] == self.med_rad[i]:
        #             corrected_scale = 6.35 / (2 * self.med_rad[i])
        #             print(f"[Auto-Correction] Medicine {i} has no visible inhibition zone.")
        #             print(f"Setting scale_factor to {corrected_scale:.8f} based on med_rad {self.med_rad[i]}")
        #             self.scale_factor = corrected_scale
        #             # Recalculate inhibition zone diameters with corrected scale
        #             self.inhibition_zone_diam = [
        #                 float(Decimal(pix * self.scale_factor * 2).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
        #                 for pix in self.inhibition_zone_pixels
        #             ]
        #             break


        #     self.med_loc = [(float(self.med_circles[0, i, 0]), float(self.med_circles[0, i, 1])) for i in range(len(self.med_circles[0]))]
        #     self.med_rad = [int(np.floor(self.med_circles[0, i, -1])) for i in range(len(self.med_circles[0]))]
        #     self.pellets = [PlateDetector.circle_crop(self.img_crop, self.med_circles[0][i].reshape((1, 1, -1)), pad=200, normalize_size=False) for i in range(len(self.med_circles[0]))]

        # except Exception as e:
        #     print('MedicineDetector Error',e)
        
        try:
            self.img_crop = PlateDetector.circle_crop(img, self.plate_circle)
            self.med_circles = MedicineDetector.detect(self.img_crop, pad=0)

            # Prepare medicine locations and radii
            self.med_loc = [
                (float(self.med_circles[0, i, 0]), float(self.med_circles[0, i, 1]))
                for i in range(self.med_circles.shape[1])
            ]
            # self.med_rad = [
            #     int(np.floor(self.med_circles[0, i, -1]))
            #     for i in range(self.med_circles.shape[1])
            # ]
            raw_radius = [self.med_circles[0, i, -1] for i in range(self.med_circles.shape[1])]
            median_radius = int(np.median(raw_radius))
            print(f"[INFO] Normalized all med_rad to median radius: {median_radius}")
            self.med_rad = [median_radius for _ in raw_radius]
                        
            self.pellets = [
                PlateDetector.circle_crop(
                    self.img_crop,
                    self.med_circles[0][i].reshape((1, 1, -1)),
                    pad=200,
                    normalize_size=False
                )
                for i in range(self.med_circles.shape[1])
            ]

            # Use first pellet with zero inhibition as scale reference
            reference_scale_set = False
            for i, rad in enumerate(self.med_rad):
                if rad > 0:
                    self.scale_factor = 6.35 / (2 * rad)
                    print(f"[INFO] Using med_rad[{i}] = {rad} → scale_factor = {self.scale_factor:.6f}")
                    reference_scale_set = True
                    break

            if not reference_scale_set:
                plate_radius_real = 6.35 / 2  # fallback
                self.scale_factor = plate_radius_real / np.mean(self.med_circles[0, :, 2])
                print(f"[WARN] No valid med_rad found — fallback scale_factor = {self.scale_factor:.6f}")

        except Exception as e:
            print('MedicineDetector Error', e)

        return self.img_crop
    
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

            if np.any(coor<=0) or np.any(coor>=img_size-1):
                break
            
        return np.array(intencities)

    '''
    def calculate_trimmed_mean(inten, proportion=0.1):
        filtered_inten = [val for val in inten if val >= 60]  # Remove values < 10
        if len(filtered_inten) == 0:
            return 0  # Return 0 if all values are filtered out
        return trim_mean(filtered_inten, proportion)
    '''
    
    def calculate_trimmed_mean_list(inten_list, proportion=0.1):
        filtered_inten = [val for val in inten_list if val >= 20]
        if not filtered_inten:
            return 0
        trimmed_inten = sorted(filtered_inten)
        trim_size = int(len(trimmed_inten) * proportion)
        trimmed_inten = trimmed_inten[trim_size:-trim_size]
        return trim_mean(trimmed_inten, proportion) if trimmed_inten else 0
        #return trim_mean(inten_list, proportion)
    def trimmean_2d(img, window_size, proportion=0.1):
        rows, cols = img.shape
        output_img = np.zeros_like(img, dtype=np.float32)
        offset = window_size // 2
        for i in range(offset, rows - offset):
            for j in range(offset, cols - offset):
                window = img[i - offset : i + offset + 1, j - offset : j + offset + 1]
                pixel_values = window.flatten().tolist()
                trimmed_mean_val = PelletsDetector.calculate_trimmed_mean_list(pixel_values, proportion)
                output_img[i, j] = trimmed_mean_val
        return output_img.astype(np.uint8)
    
    def calculate_trimmed_mean(inten, proportion=0.2):
        filtered_inten = [val for val in inten if val >= 50]  # ตัดค่าต่ำกว่า 50 ออกก่อน
        if not filtered_inten:
            return 0
        trimmed_inten = sorted(filtered_inten)
        trim_size = int(len(trimmed_inten) * proportion)
        trimmed_inten = trimmed_inten[trim_size:-trim_size]
        return trim_mean(trimmed_inten, proportion) if trimmed_inten else 0
        # return trim_mean(inten, proportion)
        
    def predict_diameter(self):
        inhibition_zone_pixels = []
        inhibition_zone_diam = []
        global closing_list
        closing_list = []
        cut_list = []

        kernel2 = np.ones((6, 6), np.uint8)

        for i in range(len(self.med_loc)):
            img_polar = PelletsDetector.img_polar_transfrom(self.img_crop, self.med_loc[i])
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(3, 3))
            img_clahe = clahe.apply(img_polar)
            sharpened = cv2.filter2D(img_clahe, -1, np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]]))
            
            window_size = 4
            trimmed_mean_2d_img = PelletsDetector.trimmean_2d(sharpened, window_size, proportion=0.1)
            blurred_image = trimmed_mean_2d_img
            blurred_image_bilateral = cv2.bilateralFilter(blurred_image, d=5, sigmaColor=20, sigmaSpace=20)
            blurred_image = blurred_image_bilateral

            blurred_image = cv2.GaussianBlur(sharpened, (3,3), 0)
            blurred_image = median_filter(blurred_image, size=3)
            erosion = cv2.erode(blurred_image, kernel2, iterations=1)
            dilation = cv2.dilate(erosion, kernel2, iterations=1)
            closing = cv2.morphologyEx(dilation, cv2.MORPH_CLOSE, kernel2)
            brightness = 0
            contrast = 1.5
            sharpened = cv2.addWeighted(closing, contrast, np.zeros(closing.shape, closing.dtype), 0, brightness)
            #sharpened = adjust_brightness(sharpened, 50)
            normalized = cv2.normalize(sharpened, None, 0, 255, cv2.NORM_MINMAX)
            closing_list.append(normalized.astype(np.uint8))

        intensity_r = []
        global_closing_list_sort = closing_list
        for i in range(len(self.med_loc)):
            global_closing_list_sort[i] = np.sort(closing_list[i])
        
        for i in range(len(self.med_loc)):
            raw_intensity = [PelletsDetector.calculate_trimmed_mean(inten) for inten in global_closing_list_sort[i][0:420]]
            #intensity_r.append(savgol_filter(raw_intensity, window_length=9, polyorder=3))
            intensity_r.append(gaussian_filter1d(raw_intensity, sigma=3))
        
        for i in range(len(self.med_loc)):
            img_polar_original = PelletsDetector.img_polar_transfrom(self.img_crop, self.med_loc[i])   
            img = global_closing_list_sort[i]
            height, width = img.shape
            
            intensity_r_image = np.array(intensity_r[i]).reshape(-1, 1)  # Reshape to column vector
            intensity_r_image = np.tile(intensity_r_image, (1, width))
            

            intensity_r_image = np.clip(intensity_r_image, 0, 255).astype(np.uint8)
            kernel_sharpen = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
            intensity_r_image = cv2.filter2D(intensity_r_image, -1, kernel_sharpen)
            
            angle_profile = np.array(intensity_r[i]) 
            angle_profile = np.array(intensity_r[i]) / 255 * 100

            angle_y_mavg = moving_average(angle_profile, 2)
            for r in range(self.med_rad[0]):
                angle_y_mavg[r] = 100
            
            angle_dy = np.diff(angle_y_mavg)
            angle_dy[:self.med_rad[0] + 20] = np.abs(angle_dy[:self.med_rad[0] + 20])
            #threshold = np.mean(moving_average(abs(angle_dy), 4)) / np.std(angle_dy) + 0.3
            threshold = 0.45
            
            peaks, _ = find_peaks(angle_dy, height=threshold)
            peaks = [int(p) for p in peaks]

            if len(peaks) >= 2 and len(peaks) < 10:
                # Sort peaks by their position (not just height)
                peaks.sort()
                highest_peak = max(peaks, key=lambda p: angle_dy[p])
                
                # Step 1: Find the first peak after highest_peak that is at least 10 pixels away
                second_highest_peak = None
                for peak in peaks:
                    if peak > highest_peak and (peak - highest_peak) > 25:
                        second_highest_peak = peak
                        break

                # Step 2: Check if there is a higher peak within 50 pixels of the selected second peak
                if second_highest_peak:
                    for peak in peaks:
                        if peak > second_highest_peak and (peak - second_highest_peak) <= 100:
                            if angle_dy[peak] > angle_dy[second_highest_peak]:  # Select the higher peak
                                second_highest_peak = peak
                                
                if 500 <= height <= 550 and second_highest_peak is not None and second_highest_peak > 380:
                    second_highest_peak = highest_peak  
                    
                # New condition: If selected peak is not the first highest peak, check with peaks under threshold
                if second_highest_peak and second_highest_peak != highest_peak and height >= 200 and second_highest_peak <= 360:
                    small_peaks, _ = find_peaks(angle_dy, height=0)  # Get all peaks
                    small_peaks = [int(p) for p in small_peaks if angle_dy[p] < threshold]  # Filter for ones below threshold
                    
                    avg_value = 0
                    if small_peaks:
                        avg_value = sum(angle_dy[p] for p in small_peaks) / len(small_peaks)
                        #print(f"Medicine {i} - Average value of peaks under threshold: {avg_value:.3f}")
                        selected_peak_value = angle_dy[second_highest_peak]
                        diff = abs(selected_peak_value - avg_value)
                        #print(f"Medicine {i} - Selected peak value: {selected_peak_value:.3f}")
                        #print(f"Medicine {i} - Difference between selected peak and average: {diff:.3f}")
                        similarity_threshold = 0.39
                        if diff < similarity_threshold:
                            #print(f"Medicine {i} - Difference is below threshold ({similarity_threshold}), using highest peak instead")
                            second_highest_peak = highest_peak

                if second_highest_peak is None:
                    second_highest_peak = highest_peak
            else:
                print(f"Warning: No valid second peak found for medicine {i}, using median radius instead.")
                highest_peak = second_highest_peak = self.med_rad[i]  # Fallback to med_rad

            
            plt.figure(figsize=(12, 6))
            plt.subplot(1, 4, 1)
            plt.xlabel("angle")
            plt.ylabel("Range from medicine center")
            plt.imshow(img_polar_original, cmap='gray')
            plt.subplot(1, 4, 2)
            plt.xlabel("angle")
            plt.ylabel("Range from medicine center")
            plt.imshow(global_closing_list_sort[i], cmap='gray')
            plt.subplot(1, 4, 3)
            plt.xlabel("angle")
            plt.ylabel("Range from medicine center")
            plt.imshow(intensity_r_image, cmap='gray', aspect='auto')
            plt.subplot(1, 4, 4)  
            plt.plot(range(len(angle_dy)), angle_dy, label="Pixel Value Change")
            plt.axhline(y=threshold, color='r', linestyle='--', label="Threshold")
            #if len(peaks) >= 1:
            #    plt.scatter(highest_peak, angle_dy[highest_peak], color='r', zorder=3, label="Highest Peak")
            if second_highest_peak is not None and second_highest_peak != highest_peak:
                start_idx = max(0, second_highest_peak - 50)
                min_prev_value = np.min(angle_dy[start_idx:second_highest_peak])
                min_prev_idx = start_idx + np.argmin(angle_dy[start_idx:second_highest_peak])
                plt.scatter(second_highest_peak, angle_dy[second_highest_peak], color='g', zorder=3, label="Selected Change point")
                #plt.scatter(min_prev_idx, min_prev_value, color='y', zorder=3, label="Min Previous Value")
                #plt.plot([min_prev_idx, second_highest_peak], [min_prev_value, angle_dy[second_highest_peak]], 'y--', alpha=0.7)
                plt.text(min_prev_idx + 5, (min_prev_value + angle_dy[second_highest_peak])/2, 
                        f"Diff: {angle_dy[second_highest_peak] - min_prev_value:.2f}", fontsize=9)
            plt.xlabel("Range from medicine center")
            plt.ylabel("Derivative")
            plt.legend()
            plt.tight_layout()
            plt.show()
            
            
            if self.med_rad[i] is None:
                print(f"Warning: self.med_rad[{i}] is None, setting it to 0")
                self.med_rad[i] = 0 

            predict_radius = second_highest_peak - self.med_rad[i]
            
            # value = float((self.med_rad[i] + predict_radius) * self.scale_factor * 2)  # Convert to Python float
            # rounded_value = float(Decimal(value).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
            # inhibition_zone_diam.append(rounded_value)
            # #inhibition_zone_diam.append(round((self.med_rad[i] + predict_radius) * self.scale_factor * 2, 2))
            # #inhibition_zone_diam.append(float(round((self.med_rad[i] + predict_radius) * self.scale_factor * 2, 2)))
            # inhibition_zone_pixels.append(int(self.med_rad[i] + predict_radius))
            
            if second_highest_peak == highest_peak:
                inhibition_zone_diam.append(6.35)
                inhibition_zone_pixels.append(self.med_rad[i])
                print(f"[INFO] Medicine {i}: First peak only, assigning fixed diameter 6.35 mm")
            else:
                value = float((self.med_rad[i] + predict_radius) * self.scale_factor * 2)
                rounded_value = float(Decimal(value).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
                inhibition_zone_diam.append(rounded_value)
                inhibition_zone_pixels.append(int(self.med_rad[i] + predict_radius))
            
        self.inhibition_zone_pixels = inhibition_zone_pixels
        self.inhibition_zone_diam = inhibition_zone_diam
        print(f"Inhibition Zone Pixels: {self.inhibition_zone_pixels}")
        print(f"Inhibition Zone Diameter: {self.inhibition_zone_diam}")
    
         
    def draw_inhibition_zone(self):
        if len(self.med_loc) != len(self.inhibition_zone_pixels):
            print(f"Error: Mismatch in number of detected medicines ({len(self.med_loc)}) and inhibition zone pixels ({len(self.inhibition_zone_pixels)})")
            return  # Exit if the lengths don't match
    
        img_with_zones = self.img_crop.copy()

        for idx, med_location in enumerate(self.med_loc):
            center = (int(med_location[0]), int(med_location[1]))  # Medicine center coordinates
            radius = self.inhibition_zone_pixels[idx]  # Predicted radius in pixels
            color = (255, 0, 0) 
            thickness = 2  

            cv2.circle(img_with_zones, center, radius, color, thickness)
    
        plt.imshow(img_with_zones, cmap="gray")
        plt.title("Inhibition Zones")
        plt.show()
        
        
    def debug_print(self):
        print("========== DEBUG INFO ==========")
        print("med_loc:", self.med_loc)
        print("med_rad:", self.med_rad)
        print("================================")

detector = PelletsDetector()
image_path = "img for test/13.jpg"
result = detector.process_image(image_path)

detector.debug_print()
detector.predict_diameter()
detector.draw_inhibition_zone()