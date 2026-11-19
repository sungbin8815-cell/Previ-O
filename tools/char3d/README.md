# Image → rigged character (free)

1. Concept art: full body, A-pose, front view, plain light background (`chars/concept/*.png`).
2. Shape: Hunyuan3D-2 on Hugging Face (`/shape_generation`, gradio_client), untextured GLB.
3. `venv/bin/python h3d_paint.py shape.glb concept.png painted.glb 40000` — decimate, project the concept art as the texture
   (front projection, background pixels replaced by the nearest figure colour), hair colour on the back of the head.
4. `venv/bin/python h3d_rig.py painted.glb out.vrm "이름"` — feet to the origin, joints measured from the mesh, VRM-named skeleton,
   heat weights, T-pose baked as rest, top / bottom / shoes split into VRoid-named materials (with each part's brightness as `ref`)
   so the app's colour picker can recolour them; VRMC_vrm humanoid written into the GLB.
