import os
import numpy as np
import cv2
import json

from lib.visualization import plotting
from lib.visualization.video import play_trip

from visual_odometry import VisualOdometry

from tqdm import tqdm

def main():
    data_dir = "CUSTOM_sequence" #
    vo = VisualOdometry(data_dir)

    play_trip(vo.images)

    poses = []
    odom = []
    estimated_path = []
    images=os.listdir(os.path.join(data_dir, "images"))
    print(images)
    for i, img in enumerate(tqdm(images, unit="pose")):
        if i == 0:
            cur_pose = np.eye(4, dtype=np.float64)
        else:
            q1, q2 = vo.get_matches(i)
            transf = vo.get_pose(q1, q2) # transformation from world to camera, from extrinsic matrix
            transf = np.linalg.inv(transf)
            odom.append(transf.tolist())
            cur_pose = cur_pose @ transf # this calculated delta needs to be inverted to convert from camera to world
            poses.append(cur_pose.tolist())
       # gt_path.append((gt_pose[0, 3], gt_pose[2, 3]))
        estimated_path.append((cur_pose[0, 3], cur_pose[2, 3]))

    plotting.visualize_paths(estimated_path, estimated_path, "Visual Odometry", file_out=os.path.basename(data_dir) + ".html")
    
    # save off path to json
    with open('poses.json', 'w') as fp:
        json.dump({ "poses" : poses }, fp)

    # save off odometry 
    with open('odometry.json', 'w') as fp:
        json.dump({ "poses" : odom }, fp)

if __name__ == "__main__":
    main()