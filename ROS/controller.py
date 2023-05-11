#!/usr/bin/env python
import rospy
from std_msgs.msg import String
from geometry_msgs.msg import Twist
import pygame

# CONTROLLER METHODS

joysticks = []
joystick = {}
SPEED = 3

def read_axis(event):
    joystick = joysticks[event.instance_id]
    return joystick.get_axis(event.axis)

def read_controller(directions):

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            done = True  # Flag that we are done so we exit this loop.

        if event.type == pygame.JOYAXISMOTION:

            if event.axis == 5:
                print("Forward")
                directions['x'] = SPEED * (read_axis(event) + 1.0)

            elif event.axis == 2:
                print("Backward")
                directions['x'] = SPEED * (-1 * (read_axis(event) + 1.0))

            elif event.axis == 0:
                print("Turn")
                directions['z'] = -read_axis(event)

        # Handle hotplugging
        if event.type == pygame.JOYDEVICEADDED:
            # This event will be generated when the program starts for every
            # joystick, filling up the list without needing to create them manually.
            joy = pygame.joystick.Joystick(event.device_index)
            joysticks[joy.get_instance_id()] = joy
            print(f"Joystick {joy.get_instance_id()} connected")

        if event.type == pygame.JOYDEVICEREMOVED:
            del joysticks[event.instance_id]
            print(f"Joystick {event.instance_id} disconnected")

    return directions
    
def talker():

    pub = rospy.Publisher('husky_velocity_controller/cmd_vel', Twist, queue_size=10)
    rospy.init_node('husky_controller', anonymous=True)
    rate = rospy.Rate(10) # 10hz

    directions = { 'x' : 0, 'z' : 0 }

    while not rospy.is_shutdown():

        directions = read_controller(directions)
        joysticks[0].rumble(-0.7 * directions['x'] / (2 * SPEED), 0.7 * directions['x'] / (2 * SPEED), 50)
        print(directions)

        message = Twist()
        message.angular.z = directions['z']
        message.linear.x = directions['x']

        # rospy.loginfo(message)
        pub.publish(message)
        rate.sleep()

if __name__ == '__main__':
    try:
        pygame.joystick.init()
        joysticks = [pygame.joystick.Joystick(x) for x in range(pygame.joystick.get_count())]
        print(joysticks)
        pygame.init()
        talker()
    except rospy.ROSInterruptException:
        pass