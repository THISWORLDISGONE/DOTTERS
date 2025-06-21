#!/bin/zsh

# DOTTERS project quick-push script
git add . && \
git commit -m "Update: $(date +'%Y-%m-%d %H:%M:%S')" && \
git push origin main

# Check push status
if [ $? -eq 0 ]; then
  echo "✅ Successfully pushed changes"
else
  echo "❌ Push failed. Check git status."
fi
