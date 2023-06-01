### Implements the actual loop closure
from asyncore import loop
import os
import cv2 
from lib.pydbow import BagOfWords
import numpy as np
from tqdm import tqdm
from scipy.spatial import distance

# # Load pydbow
# bow = BagOfWords()
# bow.load("custom.npy")

# folder = "./CUSTOM_sequence/images"

# # Take in an array of histograms
# images = []
# print("Loading images...")
# for cat in tqdm(os.listdir(folder)):
#     img = cv2.imread(folder + "/" + cat,0)
#     if img is not None:
#         images.append((img, cat))

# images = sorted(images, key = lambda x: x[1])

# # Loop over the histograms
# print("Generating image histograms...")

# histograms = []
# for image, _ in tqdm(images):
#     hist = bow.get_image_histogram(image)
#     histograms.append(hist)

# ## Save off histograms
# histograms = np.array(histograms)
# np.save("histograms", histograms)

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
# print(loop_indices)
loop_indices = list(filter(lambda x: x[0][0] - x[0][1] > 50, loop_indices))
loop_indices = sorted(loop_indices, key = lambda x: -x[1]) # find best loop candidate

print(loop_indices)
loop = loop_indices[0]

