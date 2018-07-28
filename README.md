cube linux setup contained in the txt file:
cube-setup.txt

*******************************************
audiocube is a Node application that is started on boot and waits for OSC commands which can start and stop playback of audio files stored on the device. Audio playback and levels are manipulated by NodeJS spawn functions controlling playback (sox) and the linux audio mixer (amixer) respectively. 





Listens on port 57123
Transmits (status msgs) on port 57121

methods:


