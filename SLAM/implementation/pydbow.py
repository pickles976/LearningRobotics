import numpy as np
import cv2
import os
from sklearn.cluster import MiniBatchKMeans
from tqdm import tqdm

from lib.util import extract_orb_features, closest_centroid

class BagOfWords:

    def __init__(self, n_clusters=150):
        self.visual_words = None
        self.n_clusters = n_clusters
        self.orb = cv2.ORB_create(nfeatures=1500)

    def generate_from_images(self, image_dir):
        
        images = self._load_images_from_folder(image_dir)
        
        # descriptor list is unordered one, sift features that is seperated class by class for train data
        descriptor_list = extract_orb_features(images) 
        descriptor_list = np.stack(descriptor_list, dtype=np.float32)

        kmeans = MiniBatchKMeans(n_clusters=self.n_clusters, n_init=10)
        kmeans.fit(descriptor_list)
        self.visual_words = kmeans.cluster_centers_ 

        print(f"Visual Words: {self.visual_words.shape}")

    def save(self, filename):
        np.save(filename, self.visual_words)

    def load(self, filename):
        self.visual_words = np.load(filename)

    def get_image_histogram(self, image):

        # compute image histogram from features 
        histogram = np.zeros(len(self.visual_words))

        kp, des = self.orb.detectAndCompute(image,None)

        if des is not None:
            for each_feature in des:
                ind = closest_centroid(each_feature, self.visual_words)
                histogram[ind] += 1

        return histogram


    def _load_images_from_folder(self, folder):
        images = []
        for cat in os.listdir(folder):
            img = cv2.imread(folder + "/" + cat,0)
            if img is not None:
                images.append(img)
        return images
