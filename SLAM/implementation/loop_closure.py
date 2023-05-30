### Implements the actual loop closure
import os
import cv2 
from lib.pydbow import BagOfWords
import numpy as np
from tqdm import tqdm

# Load pydbow
bow = BagOfWords()
bow.load("custom.npy")

folder = "./CUSTOM_sequence/images"

# Take in an array of histograms
images = []
print("Loading images...")
for cat in tqdm(os.listdir(folder)):
    img = cv2.imread(folder + "/" + cat,0)
    if img is not None:
        images.append((img, cat))

images = sorted(images, key = lambda x: x[1])

# Loop over the histograms and calculate document frequency for scores
print("Generating image histograms...")
occurences = np.zeros(len(bow.visual_words))

histograms = []
for image in tqdm(images):
    hist = bow.get_image_histogram(image)
    histograms.append(hist)
    for i in range(len(hist)):
        if hist[i] > 0:
            occurences[i] += 1.0

## Save off histograms
histograms = np.array(histograms)
np.save("histograms", histograms)

print("Finished calculating histograms")
