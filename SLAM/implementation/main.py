### Load pose graph and find loop constraint, optimize over constraints
import symforce as sf
import json
import numpy as np
from lib.pydbow import BagOfWords
from tqdm import tqdm
import os
import cv2
from scipy.spatial import distance

# 0. Load Images
folder = "./CUSTOM_sequence/images"
images = []
print("Loading images...")
for cat in tqdm(os.listdir(folder)):
    img = cv2.imread(folder + "/" + cat,0)
    if img is not None:
        images.append((img, cat))

images = sorted(images, key = lambda x: x[1])

# 1. Load Pose Graph
poses = None
with open('poses.json', 'r') as f:
    poses = json.load(f)["poses"]

poses = list(map(lambda x: np.asarray(x, dtype=np.float32), poses))

# 2. Load bag of words
bow = BagOfWords()
bow.load("custom.npy")

# 3. Apply loop closure algorithm
histograms = []
loop_indices = []

print("Detecting loops...")
histograms = np.load("histograms.npy")
loop_indices = []

# For every histogram
for i in range(10,len(histograms)):
    
    # Current frame
    current = histograms[i]

    # Check all previous frames
    for j in range(i - 10, 0, -1):
        cur_dist = 1 - distance.cosine(histograms[i], histograms[j])

        # check that the cu
        if cur_dist > 0.9 and cur_dist > (3.0 * distance.cosine(histograms[i], histograms[i-1])):
            loop_indices.append(((i, j), cur_dist))

# Throw out matches that are too close
loop_indices = list(filter(lambda x: x[0][0] - x[0][1] > 50, loop_indices))
loop_indices = sorted(loop_indices, key = lambda x: -x[1]) # find best loop candidate

print(loop_indices)
loop = loop_indices[0]

# 4. Generate constraints for pose graph

# 5. Optimize pose graph