# echo-client.py

import socket
import pickle
import struct
import cv2

# HOST = "raspberrypi"  # The server's hostname or IP address
HOST = "172.20.1.41"
PORT = 65432  # The port used by the server

# how to read the data
data = b""
payload_size = struct.calcsize(">L") # ???
print("payload_size: {}".format(payload_size))

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:

    print("Connecting to host...")

    s.connect((HOST, PORT))

    while True:

        # Concatenate packets while data < payload size
        while len(data) < payload_size:
            print("Recv: {}".format(len(data)))
            data += s.recv(4096)

        print("Done Recv: {}".format(len(data)))
        packed_msg_size = data[:payload_size]
        data = data[payload_size:]
        msg_size = struct.unpack(">L", packed_msg_size)[0]
        print("msg_size: {}".format(msg_size))


        while len(data) < msg_size:
            data += s.recv(4096)
        frame_data = data[:msg_size]
        data = data[msg_size:]

        frame=pickle.loads(frame_data, fix_imports=True, encoding="bytes")
        frame = cv2.imdecode(frame, cv2.IMREAD_COLOR)
        
        cv2.imshow('ImageWindow',frame)
        cv2.waitKey(1)