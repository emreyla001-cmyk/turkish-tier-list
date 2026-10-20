import cv2
import numpy as np
import glob
import os

cap = cv2.VideoCapture('tiktok_scp.mp4')
fps = cap.get(cv2.CAP_PROP_FPS)

# Let's inspect frames at specific intervals and save them
# We want to identify every single character that is pitted against SCP 2747
os.makedirs('character_sequence', exist_ok=True)

# Let's sample every 0.3 seconds
frame_no = 0
count = 0
last_img = None

while cap.isOpened():
    ret, frame = cap.read()
    if not ret: break
    
    if frame_no % 10 == 0:
        sec = frame_no / fps
        # crop the right side where the character is
        h, w, _ = frame.shape
        right = frame[int(h*0.3):int(h*0.8), int(w*0.5):]
        top = frame[int(h*0.05):int(h*0.15), int(w*0.3):int(w*0.7)]
        
        # Check if right is not completely dark/empty
        if right.mean() > 10:
            cv2.imwrite(f'character_sequence/frame_{count:03d}_sec_{sec:04.1f}.jpg', frame)
            count += 1
            
    frame_no += 1

cap.release()
print(f'Done! Saved {count} frames.')
