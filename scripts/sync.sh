#!/bin/bash

# rsync -e ssh --rsync-path="sudo rsync" -rptn --delete --progress /mnt/g/Audio/mp3/Music trentj@192.168.1.200:/mnt/usb/mp3
# rsync -e ssh --rsync-path="sudo rsync" -rpt --delete --progress "/mnt/g/mp3/Music/The Cult" trentj@192.168.1.200:/home/trentj/media/mp3/Music

#sudo mount -t drvfs K: /mnt/k -o uid=$(id -u $USER),gid=$(id -g $USER),metadata
#rsync -e ssh --rsync-path="sudo rsync" -rptn --delete --progress /mnt/g/Audio/mp3/Music /mnt/k/mp3

# pi
#rsync -e ssh -rpt --delete --progress "/mnt/g/mp3/Music" trentj@192.168.1.200:/home/trentj/media/mp3

# LilBuddy
rsync -e ssh -rpt --delete --progress "/mnt/i/mp3/Music" trentj@192.168.1.136:/home/trentj
