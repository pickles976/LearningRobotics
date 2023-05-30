from pydbow import BagOfWords
import cv2
from scipy.spatial import distance
import os

bow = BagOfWords()
bow.generate_from_images("./data")

image = cv2.imread("./data/1.png",0)
hist = bow.get_image_histogram(image)

for fname in os.listdir("data"):
    img = cv2.imread(os.path.join("data", fname), 0)
    temp_hist = bow.get_image_histogram(img)
    similarity = distance.euclidean(hist, temp_hist)
    print(f"Distance between 1.png and {fname}: {similarity}")
