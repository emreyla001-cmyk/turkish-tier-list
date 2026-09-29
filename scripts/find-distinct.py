import cv2
import numpy as np
import glob
import os

files = sorted(glob.glob('character_sequence/*.jpg'))

# Let's find frames where a character on the right is stable
distinct_characters = []
prev_right = None

for f in files:
    img = cv2.imread(f)
    h, w, _ = img.shape
    right = img[int(h*0.3):int(h*0.8), int(w*0.55):]
    
    if prev_right is None:
        distinct_characters.append(f)
        prev_right = right
    else:
        diff = np.mean(np.abs(right.astype(float) - prev_right.astype(float)))
        if diff > 45: # significant new character or background
            distinct_characters.append(f)
            prev_right = right

os.makedirs('distinct', exist_ok=True)
print(f'Found {len(distinct_characters)} distinct scenes.')
for idx, f in enumerate(distinct_characters):
    img = cv2.imread(f)
    cv2.imwrite(f'distinct/c_{idx:02d}.jpg', img)
    print(f'c_{idx:02d}.jpg: {f}')
