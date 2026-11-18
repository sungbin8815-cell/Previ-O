#!/bin/bash
# every Rocketbox avatar -> /home/user/previ-o/chars/vrm/rb/<name>.vrm + thumbs/<name>.webp; sources fetched one at a time and deleted
S=/tmp/claude-0/-home-user-previ-o/286193a8-8153-5b7d-86e8-6bdc6b387104/scratchpad; R=/home/user/microsoft/microsoft-rocketbox; O=/home/user/previ-o/chars/vrm/rb
mkdir -p $O/thumbs $S/rb/work
cd $R
for png in $(git ls-tree -r --name-only HEAD | grep -E "^Assets/Avatars/[^/]+/[^/]+/[^/]+\.png$"); do
  dir=$(dirname $png); name=$(basename $dir)
  [ -f $O/$name.vrm ] && continue
  W=$S/rb/work/$name; rm -rf $W; mkdir -p $W/Export $W/Textures
  timeout 300 git show "HEAD:$dir/Export/$name.fbx" > $W/Export/$name.fbx 2>/dev/null || { echo "SKIP $name (no fbx)"; rm -rf $W; continue; }
  for t in $(git ls-tree --name-only HEAD "$dir/Textures/" | grep -E "\.tga$" | grep -vE "specular|wrinkle"); do timeout 300 git show "HEAD:$t" > $W/Textures/$(basename $t); done
  timeout 300 git show "HEAD:$png" > $W/thumb.png
  $S/venv/bin/python $S/rb_convert.py $W $O/$name.vrm "$name" 2>&1 | grep -E "KB|missing|rror" | tail -2
  python3 -c "from PIL import Image; im=Image.open('$W/thumb.png').convert('RGB'); w,h=im.size; s=min(w,h); im=im.crop(((w-s)//2,0,(w+s)//2,s)).resize((160,160)); im.save('$O/thumbs/$name.webp',quality=80)" 2>/dev/null
  rm -rf $W
done
echo DONE; ls $O/*.vrm | wc -l; du -sh $O
