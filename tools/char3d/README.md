# Concept art (four views) → rigged character (free)

1. Turnaround from Dreamina (front, left, back, right in one row) → split into `chars/concept/<id>_{front,back,left,right}.png`.
2. Shape: Hunyuan3D-2mv on Hugging Face (`/shape_generation` with the four `mv_image_*`), via gradio_client with the HF token.
3. `venv/bin/python h3d_paint4.py shape.glb front.png back.png left.png right.png painted.glb 40000` — each face painted from the view
   it faces, registered by matching the mesh's silhouette to each picture's figure, with hidden faces (behind a hand, between the
   legs) taken from the next view.
4. `venv/bin/python h3d_rig.py painted.glb out.vrm "이름"` — skeleton fitted to the mesh, skin weights, top / bottom / shoes split
   for recolouring, VRM 1.0 humanoid. Arms kept as modelled when they hang close to the body (angle stored as previoRestArm).
5. Add it to `VRM_LIB` in index.html with its `who` and `age`: the app then draws it for every cast member of that sex and age.
