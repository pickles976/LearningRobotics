# echo-server.py

import socket
import struct
import cv2
import time
import pickle

print("Initializing webcam...")
imgCap = cv2.VideoCapture(0)
print("Webcam initialized!")

HOST = ""  # Standard loopback interface address (localhost)
PORT = 65432  # Port to listen on (non-privileged ports are > 1023)
FPS = 10.0

encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 90]

time_elapsed = 0
prev = 0
img_counter = 0

print("Waiting for connections...")
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind((HOST, PORT))
    s.listen()
    conn, addr = s.accept()
    with conn:
        print(f"Connected by {addr}!")
        while True:

            time_elapsed = time.time() - prev

            if time_elapsed > 1.0/FPS:

                # read frame
                ret, frame = imgCap.read()

                # encode frame as bytearray
                result, frame = cv2.imencode('.jpg', frame, encode_param)
                data = pickle.dumps(frame, 0)
                size = len(data)
                
                print(f"{img_counter}: {size}")

                # send with size
                conn.sendall(struct.pack(">L", size) + data)
                img_counter += 1
                prev = time.time()