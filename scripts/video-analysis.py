import cv2
import os

# Let's inspect the exact frames around each second to get the full clear sequence of characters in leon.wextra's video:
cap = cv2.VideoCapture('tiktok_scp.mp4')
fps = cap.get(cv2.CAP_PROP_FPS)

# We know the stages:
# EASY: 0-16s
# MEDIUM: 17-28s
# HARD: 29-40s
# EXTREME: 41-52s
# IMPOSSIBLE: 53-66s

print('Extracting exact character portraits...')
# Let's save a clean crop of each character from the video
cap.release()
