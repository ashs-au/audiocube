# Audiocube

audiocube is a Node application that is started on boot and waits for OSC (Open Sound Control) commands which can start and stop playback of audio files stored on local disk or card etc. Audio playback and levels are manipulated by NodeJS spawn functions controlling playback (sox) and the linux audio mixer (amixer) respectively. 

Spawned tasks return information in OSC format to a nominated host so that the aplication status can be monitored without needing to ssh onto the the device and check console messages etc.

The app was originally developed from the code on an earlier random-playback 'musicbox' device I developed to soundtrack a gallery show: "Stuck in the Mud" (Verge Gallery, Sydney 2016). Audiocube was developed as the client element running on several player devices situated amongst the audience for Julie Vulcan's performance work: "Darklight" (Metro Arts, Brisbane 2017) - satisfying the function of spatializing elements of the sound design across the entire theatre.

The playback devices in this case were created from Rasberry Pi A+ boards with added wifi and audio components.

Notes
* Listens on port 57123, Transmits (status msgs) on port 57121
* the audio files are stored on each device
* startup scripts configure various eccentric aspects of audio on Raspbian & launch the audiocube server app
* the Pis were built with reset/shutdown buttons and status LEDs for easy setup in headless mode.
* playback commands and player feedback are dispatched by a Max patch which receives commands from the Ableton Live session running the master audio for the show.

one of the cubes installed with Madeleine Preston's ceramics:
![audiocube installed](http://feltmakingworkshop.net/gh/images/audiocube-installed.png)

cramped insides of a prototype cube:
![audiocube insides of](http://feltmakingworkshop.net/gh/images/audiocube-interior.png)
