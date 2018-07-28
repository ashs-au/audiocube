/* audioserver node OSC 

Listens on port 57123
Transmits on port 57121

OSC messages recognised:
/play -option <filename>
/term (which includes a fadeout & then fadein)

OSC messages sent back to server endpoint
/status playing...finished
/status ready/stopped

see notes on linux amixer: https://linux.die.net/man/1/amixer
amixer sset PCM,0 98%

*/
var osc = require("osc");
var util  = require('util');
var os = require("os");

//////////////////
//VARS
//////////////////
var audioPath = '/home/pi/audio/', player = '/usr/bin/play', mixer = '/usr/bin/amixer';
var cubeID = os.hostname(), lock = false;
var serverAddress ="192.168.101.61";

var spawn = require('child_process').spawn;
var play = "", mixer =""; 		//dummy heads for spawn cmd
var fullVolume = 100; 			//const amixer level in %
var vol = 0;					//track vol level

SetVol(fullVolume);

//////////////////
//LISTEN PORT
//////////////////
var inPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 57123
}); 
//////////////////
//SEND PORT
//////////////////
var outPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    broadcast: true
});
//////////////////
//LISTEN
//////////////////
console.log("listening on port: " + inPort.options.localPort );
inPort.on("message", function(oscMsg) {
	var date = new Date();
    console.log("recieved OSC: " + date.getHours() + ":"
    	 + date.getMinutes() + ":" + date.getSeconds() + 
    	 " address: " + oscMsg.address + " args: " + oscMsg.args);
    
    if(oscMsg.address == "/play" && !lock) {
		var selection = audioPath + oscMsg.args;
		Player(selection);
	} else if(oscMsg.address == "/stop") {
		Stop();
	}
});

//////////////////
//PLAY
//////////////////
function Player(sel) {
	//SetVol(fullVolume);
	lock = true;
	//opts = ['-q ', sel]; //player, filename, volume
	//sel is an array:
	var args = sel.split(',');
	if (args.length < 2) //if no vol arg, set to full
		args.push(fullVolume);   
	var f = args[0];
	vol = args[1]; //GLOBAL VAR
	console.log("SPAWN: " + player + ' ' + f + ' ' + vol);
	SetVol(vol);
	play = spawn(player, ['-q', f]);
	Notify("/status", "playing");
	// play handlers
	play.stdout.on('data', function (data) {console.log('stdout: ' + data);	
	//nothing
	});
	play.stderr.on('data', function (data) { console.log('stderr: ' + data);
	//nothing	
	});
	play.on('exit', function (code) {
		console.log('child process exited with code ' + code);
		Notify("/status", "stopped (finished)");
		lock = false;
	});
} // ()

//////////////////
//STOP - wrap both funcs
//////////////////
function Stop() {
 	FadeVol(Terminate);
 }
//////////////////
//TERM callback function
//////////////////
var Terminate = function() {		
	play.kill(); //when fade complete
	lock == false;
	Notify("/status", " stopped (terminated)");
}
//////////////////
//FADEOUT VOL 
//////////////////
var FadeVol = function(term) {
	//only if playing:
	if(lock) {
		console.log('start fade: ' + vol);
		exec = require('child_process').exec;
		var rampdown = setInterval(function() {	
			vol = vol-5;
			var cmd = 'amixer sset PCM,0 ' + vol + '%'; //build cmd str
			exec(cmd, function (err, stdout, stderr) {
				console.log('set volume: ' + cmd);
			});
		
			if(vol < 1 ){
				clearInterval(rampdown);
				term(); //term callback
				console.log('fadeout done: ' + vol)		
			}
		}, 750);
	}//if lock true
}
//////////////////
//SET VOL 
//////////////////
function SetVol(v) {
	var cmd = 'amixer sset PCM,0 ' + v + '%'; //build cmd str
	exec = require('child_process').exec;
	exec(cmd, function (err, stdout, stderr) {
		console.log('set vol: ' + cmd);
	});
}
//////////////////
//RESET VOL back to full 
//////////////////
function FullVol() {
	var cmd = 'amixer sset PCM,0 ' + fullVolume + '%'; //build cmd str
	exec = require('child_process').exec;
	exec(cmd, function (err, stdout, stderr) {
		console.log('set vol full: ' + cmd);
	});
}
//////////////////
//NOTIFY
//////////////////
function Notify(addr, code) {
	outPort.send({
		address: addr,
		args: cubeID + " " + code
	}, serverAddress, 57121 );
}

// Open sockets 
inPort.open();
outPort.open();
