import serial
import sys

angle = sys.argv[1]
# convert angle to float
angle = float(angle)

ser = serial.Serial('COM3', 9600)

ser.write(angle)
