#!/usr/bin/env python
import rospy
from geometry_msgs.msg import Twist
from random import random

def drive_random():

    # Ceates the publisher, and tells it to publish
    # to the /husky_velocity_controller/cmd_vel topic, 
    # with a queue size of 100
    pub = rospy.Publisher('husky_velocity_controller/cmd_vel', Twist, queue_size=100)
    
    # Sets up a node
    rospy.init_node('random_husky_commands', anonymous=True)

    # Sets loop to publish at a rate of 10Hz
    rate = rospy.Rate(10)

    # Send messages on a loop
    while not rospy.is_shutdown():
        msg = Twist()
        msg.linear.x = 4 * (random() - 0.5)
        msg.angular.z = 6 * (random() - 0.5)
        rospy.loginfo(msg)
        pub.publish(msg)
        rate.sleep()


if __name__=="__main__":

	drive_random()
