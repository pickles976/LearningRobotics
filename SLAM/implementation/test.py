### Test the Bag of Words implementation on custom dataset

from pydbow import BagOfWords
import cv2
from scipy.spatial import distance
import os
import matplotlib.pyplot as plt
import numpy as np
from tqdm import tqdm
import json

def run():

    bow = BagOfWords(n_clusters=150)
    bow.load("custom.npy")

    path = "./CUSTOM_sequence/images/"

    # load the starting image
    image = cv2.imread(os.path.join(path, "img001.jpg"),0)
    hist = bow.get_image_histogram(image)

    images = []
    print("Loading images")
    for fname in tqdm(os.listdir(path)):
            images.append((cv2.imread(os.path.join(path, fname), 0), fname))

    images = sorted(images, key = lambda x: x[1])

    # obtain cosine similarity scores between images
    similarities = []
    for i, (img, fname) in enumerate(images):
        if i % 5 == 0:
            temp_hist = bow.get_image_histogram(img)
            similarity = 1.0 - distance.cosine(hist, temp_hist)
            similarities.append(similarity)
            print(f"Distance between 1.png and {fname}: {similarity}")

    with open('result.json', 'w') as fp:
        json.dump({"values" : similarities}, fp)

    plot()

def first_run():
    bow = BagOfWords()
    bow.generate_from_images("./CUSTOM_sequence/images")
    bow.save("custom")

    run()

def plot():

    similarities = {}
    with open('result.json', 'r') as fp:
        similarities = json.load(fp)["values"]

    print(similarities)
    similarities = np.array(similarities, dtype=np.float32)

    plt.title("Cosine distance per frame")
    plt.bar(range(0, len(similarities)), similarities, color ='blue')

    plt.show()

if __name__ == "__main__":
    first_run()