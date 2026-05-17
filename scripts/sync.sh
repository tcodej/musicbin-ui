#!/bin/bash

# LilBuddy
rsync -e ssh -rpt --delete --progress "/mnt/i/mp3/Music" trentj@192.168.1.136:/home/trentj

# Search for non mp3 files in current dir
# find . -not -name "*.mp3" -type f > non-mp3.txt