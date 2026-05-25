#!/bin/bash

# Search for non mp3 files in specified music dir
find "/mnt/i/mp3/Music/00 New Arrivals" -not -name "*.mp3" -not -name "*.m4a" -type f