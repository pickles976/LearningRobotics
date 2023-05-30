from scipy.spatial import distance
import numpy as np
import cv2
from tqdm import tqdm

def closest_centroid(x, centroids):
    """Finds and returns the index of the closest centroid for a given vector x"""
    distances = np.empty(len(centroids))
    for i in range(len(centroids)):
        distances[i] = distance.euclidean(centroids[i], x)
    return np.argmin(distances) # return the index of the lowest distance

def extract_orb_features(images):
        descriptor_list = []
        orb = cv2.ORB_create()

        # Loop over classes
        for image in tqdm(images):
            kp, des = orb.detectAndCompute(image,None)

            if des is not None:
                descriptor_list.extend(des)
        return descriptor_list
        