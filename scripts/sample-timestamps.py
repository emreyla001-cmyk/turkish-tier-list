import cv2
import glob
import os

# Let's inspect frames at specific timestamps to identify all characters:
timestamps = [
    # EASY (sec 3 to 17)
    3.0, 4.3, 6.0, 7.7, 9.0, 10.3, 12.0, 13.7, 15.0, 16.3,
    # MEDIUM (sec 18 to 28)
    18.7, 20.0, 21.3, 23.0, 24.3, 26.0, 27.3,
    # HARD (sec 29 to 39)
    29.0, 30.7, 32.0, 33.7, 35.0, 36.7, 38.0,
    # EXTREME (sec 40 to 55)
    40.7, 42.3, 44.3, 46.7, 48.7, 50.7, 52.3, 54.3,
    # IMPOSSIBLE (sec 56 to 65)
    56.3, 58.0, 60.0, 61.3, 63.0, 64.3
]

cap = cv2.VideoCapture('tiktok_scp.mp4')
fps = cap.get(cv2.CAP_PROP_FPS)

os.makedirs('identified', exist_ok=True)
for ts in timestamps:
    frame_idx = int(ts * fps)
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
    ret, frame = cap.read()
    if ret:
        cv2.imwrite(f'identified/ts_{ts:04.1f}.jpg', frame)
cap.release()
print('Saved timestamp samples.')
