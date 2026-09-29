import cv2
import numpy as np
import glob
import os

cap = cv2.VideoCapture('tiktok_scp.mp4')
fps = cap.get(cv2.CAP_PROP_FPS)

# Let's save every frame where a character card appears on the right
os.makedirs('matchups', exist_ok=True)

prev_right_crop = None
matchup_idx = 0
frame_no = 0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret: break
    
    # check every 5 frames
    if frame_no % 5 == 0:
        h, w, _ = frame.shape
        # right side of the screen where opponent is
        right_crop = frame[h//3:int(h*0.8), int(w*0.5):]
        
        # also top text
        top_crop = frame[int(h*0.05):int(h*0.2), int(w*0.3):int(w*0.7)]
        
        if prev_right_crop is not None:
            diff = np.mean(np.abs(right_crop.astype(float) - prev_right_crop.astype(float)))
            if diff > 35: # significant change
                sec = frame_no / fps
                cv2.imwrite(f'matchups/m_{matchup_idx:02d}_sec_{sec:.1f}.jpg', frame)
                matchup_idx += 1
                prev_right_crop = right_crop
        else:
            prev_right_crop = right_crop
            
    frame_no += 1

cap.release()
print(f'Detected {matchup_idx} potential matchup frames.')
