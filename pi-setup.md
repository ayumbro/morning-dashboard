Download Raspberry Pi Imager
https://www.raspberrypi.com/software/

Launch Pi Imager
Select Raspberry Pi OS Lite 32bit
Select the SD card
Setup Hostname(morning-dashboard.local), SSH Login and Wifi credentials, Timezone
Burn the image

ssh into morning-dashboard.local

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y --no-install-recommends xserver-xorg-video-all \
 xserver-xorg-input-all xserver-xorg-core xinit x11-xserver-utils \
 chromium-browser unclutter
#sudo apt install fonts-arphic-ukai fonts-arphic-uming
sudo apt install fonts-noto-cjk
```

```bash
sudo raspi-confi
# System Options > Boot Options > Console Autologin

vi /home/pi/.bash_profile
if [ -z $DISPLAY ] && [ $(tty) = /dev/tty1 ]
then
startx
fi

vi /home/pi/.xinitrc
#!/usr/bin/env sh
xset -dpms
xset s off
xset s noblank

unclutter &
chromium-browser https://urls.hk/md-for-my-pi \
 --window-size=1920,1080 \
 --window-position=0,0 \
 --start-fullscreen \
 --kiosk \
 --incognito \
 --noerrdialogs \
 --disable-translate \
 --no-first-run \
 --fast \
 --fast-start \
 --disable-infobars \
 --disable-features=TranslateUI \
 --disk-cache-dir=/dev/null \
 --overscroll-history-navigation=0 \
 --disable-pinch
# unclutter - remove idle cursor image from screen
```

```bash
wpa_cli -i wlan0 add_network
# return added network id for setting
wpa_cli -i wlan0 set_network 1 ssid '"XXX"'
wpa_cli -i wlan0 set_network 1 psk '"XXX"'
wpa_cli -i wlan0 enable_network 1
wpa_cli -i wlan0 save_config
```

```bash
crontab -e
5-55/10 * * * * xset -display :0.0 dpms force off
*/10 * * * * xset -display :0.0 dpms force on
```
