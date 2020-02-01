/*** Begin Shared Stuff ***/


GAME_UPDATE_SPEED = 1/60; // how much time in seconds elapses in each game frame
GAME_RENDER_SPEED = 1/30; // how fast we actually render the screen

ANIMATION_SPEED = 3 * GAME_UPDATE_SPEED;

PIXEL_SIZE = 8;

SPAWN_LABEL = "Spawning";
FONT = "20px Georgia";

GUI_FONT = "Arial";

function timestamp() {
	return Date.now() / 1000;
}

g_CurrentLevel = 1;
g_CanvasWidth = 500;
g_CanvasHeight = 500;

g_CalculatedTime = timestamp();

g_IsLeftPressed = false, g_IsRightPressed = false, g_IsUpPressed = false, g_IsDownPressed = false, g_IsSpacePressed = false;// input

g_CurrentLevel = -1;

g_MultiplierUIScale = 1;

g_MouseX = 0;
g_MouseY = 0;
g_ProcessClick = false;

// some math utility functions
function rgba(r, g, b, a) {

	return 'rgba(' + Math.floor(r) + ','+ Math.floor(g) + ',' + Math.floor(b) + ',' + a + ')';
}

function square(x) {

	return x*x;
}

function distanceSq(x1,y1, x2,y2) {

	return square(x1-x2) + square(y1-y2);
}

function getFoodValue() {
	return Math.max(1, Math.floor(g_RatCount * g_FoodMultiplier));
}

function getRandomArrayEntry(array) {
	return array[Math.min(array.length-1, Math.floor(Math.random()*array.length))];
}

// image loading support
g_ImageCache = {}
g_SoundCache = {}
g_AssetsToLoad = 0;

function onAssetLoaded() {
	g_AssetsToLoad--;
}

function loadImage(path) {

	if (path in g_ImageCache) {
		return g_ImageCache[path];
	}

	g_AssetsToLoad++;

	var image = new Image();
	image.onload = onAssetLoaded;
	image.src = path;

	g_ImageCache[path] = image;
	return image;
}

function playAudio(obj) {

	try {
		obj.audio[obj.index].play();

	} catch (err) {

	}

	obj.index = (obj.index+1)%obj.audio.length;
}

function isAudioPlaying(obj) {

	for (var n = 0; n < obj.audio.length; ++n) {
		try {
			if (!obj.audio[n].paused)
				return true;

		} catch (err) {

		}
	}	

	return false;
}

function setAudioVolume(obj, value) {

	for (var n = 0; n < obj.audio.length; ++n) {
		try {
			obj.audio[n].volume = value;

		} catch (err) {

		}
	}
}

function stopAudio(obj) {

	for (var n = 0; n < obj.audio.length; ++n) {
		try {
			obj.audio[n].pause();
			obj.audio[n].currentTime = 0;

		} catch (err) {

		}
	}

	obj.index = 0;
}

function loadAudio(path, count=1) {

	if (path in g_SoundCache) {
		return g_SoundCache[path];
	}

	result = new Object();
	result.audio = []
	result.index = 0;

	for (var n = 0; n < count; ++n){
		var a = new Audio(path);
		a.load();
		result.audio.push(a);
	}

	g_SoundCache[path] = result;

	return result;
}

function clamp(val, min, max) {

	return Math.min(max, Math.max(min, val));
}

function niceNumber(val) {

	if (val == undefined)
		return 'undefined';

	if (val == 0)
		return '0';

	var res = val < 0 ? '-' : '';
	val = Math.abs(val);

	while (val != 0) {

		if (res.length > 0) {
			res = ',' + res;
		}

		var remainder = val % 1000;
		val = Math.floor(val / 1000);

		if (val != 0) {
			if (remainder < 10) {
				res = '00' + res;
			} else if (remainder < 100) {
				res = '0' + res;
			}
		}
		

		res = remainder + res;

	}

	return res;
}

function findAnimationFrame(frames, counter) {

	var current_frame = 0;
	var current_sum = 0;

	for (var n = 0; n < frames.length; ++n) {

		current_sum += frames[n][1];

		if (counter <= current_sum) {
			return frames[n][0];
		}
	}

	return frames[frames.length-1][0];
}

LEFT_KEYCODE = 37;
RIGHT_KEYCODE = 39;
SPACE_KEYCODE = 32;
UP_KEYCODE = 38;
DOWN_KEYCODE = 40;

// handles input
document.addEventListener('keydown', function(e) {
	
	if (e.keyCode == LEFT_KEYCODE) {

		e.preventDefault();
		g_IsLeftPressed = true;

	} else if (e.keyCode == RIGHT_KEYCODE) {
		
		e.preventDefault();
		g_IsRightPressed = true;

	} else if (e.keyCode == UP_KEYCODE) {
		
		e.preventDefault();
		g_IsUpPressed = true;

	} else if (e.keyCode == DOWN_KEYCODE) {
		
		e.preventDefault();
		g_IsDownPressed = true;

	} else if (e.keyCode == SPACE_KEYCODE) {

		e.preventDefault();
		g_IsSpacePressed = true;
	}
});

document.addEventListener('keyup', function(e) {
	
	if (e.keyCode == LEFT_KEYCODE) {
	
		e.preventDefault();
		g_IsLeftPressed = false;

	} else if (e.keyCode == RIGHT_KEYCODE) {
	
		e.preventDefault();
		g_IsRightPressed = false;
	}
	if (e.keyCode == UP_KEYCODE) {
	
		e.preventDefault();
		g_IsUpPressed = false;

	} else if (e.keyCode == DOWN_KEYCODE) {
	
		e.preventDefault();
		g_IsDownPressed = false;

	} else if (e.keyCode == SPACE_KEYCODE) {
		e.preventDefault();
		g_IsSpacePressed = false;
	}
});

window.onmousemove = function(e) {
	g_MouseX = e.offsetX;
	g_MouseY = e.offsetY;
}

window.onclick = function(e) {
	g_ProcessClick = true;
	g_MouseX = e.offsetX;
	g_MouseY = e.offsetY;
	
}

function calcAnimLength(animation) {
	var result = 0;
	for (var n = 0; n < animation.length; ++n) {
		result += animation[n][1];
	}

	return result;
}

function mainLoop() {

	var update_func = null;
	var draw_func = null;

	if (g_AssetsToLoad > 0) {

		draw_func = drawLoadScreen;

	} else if (g_GameState == GAME_STATE_DEAD) {

		draw_func = drawEndGame;

	} else {
		update_func = updateGame;
		draw_func = drawGame;
	}

	if (update_func) {

		// this updates our fixed game loop multiple times until we reach real time
		while (g_CalculatedTime < timestamp()) {
			
			update_func();
			
			g_CalculatedTime += GAME_UPDATE_SPEED;
		}
	} else {

		g_CalculatedTime = timestamp();
	}

	draw_func();

	g_ProcessClick = false;
}

//function addPulser(x, y, color, spawnDelay, radius, waveSpeed, initialTime = 0) {
window.onload = function(e) {

	var cvs = document.getElementById("cvs");

	game_LoadAssets();

	g_CanvasWidth = cvs.width;
	g_CanvasHeight = cvs.height;

	setInterval(mainLoop, GAME_RENDER_SPEED);
};

/*** End shared stuff ***/

GAME_STATE_LOADING = 0
GAME_STATE_PLAYING = 1
GAME_STATE_DEAD = 2

g_GameState = GAME_STATE_LOADING

// this is for animation frames
g_StateCounter = 0

TILE_WIDTH = 25
TILE_HEIGHT = 25
TILE_SIZE = 40

g_PlayerX = 5;
g_PlayerY = 5; // player position
g_PlayerFrame = 0; // current frame of the player
g_WasLeftPressed = false, g_WasRightPressed = false, g_WasUpPressed = false, g_WasDownPressed = false, g_WasSpacePressd = false;
g_MirrorPlayerX = true;

g_PlayerDrawX = g_PlayerX * TILE_SIZE;
g_PlayerDrawY = g_PlayerY * TILE_SIZE;

g_PlayerUpFrames = [];
g_PlayerRightFrames = [];
g_PlayerDownFrames = [];
g_CurrentPlayerAnim = null;
g_InputRepeatCounter = 0;

function updatePlayerPos() {

	if (g_IsLeftPressed || g_IsRightPressed || g_IsUpPressed || g_IsDownPressed) {
		g_InputRepeatCounter++;
	} else {
		g_InputRepeatCounter = 0;
	}

	if (g_InputRepeatCounter > 10) {
		g_WasLeftPressed = false;
		g_WasRightPressed = false;
		g_WasUpPressed = false;
		g_WasDownPressed = false;
		g_InputRepeatCounter = 0;
	}

	if (g_IsLeftPressed && !g_WasLeftPressed) {
		g_PlayerX -= 1;
		g_MirrorPlayerX = true;
		g_CurrentPlayerAnim = g_PlayerRightFrames;
	}

	if (g_IsRightPressed && !g_WasRightPressed) {
		g_PlayerX += 1;
		g_MirrorPlayerX = false;
		g_CurrentPlayerAnim = g_PlayerRightFrames;
	}

	if (g_IsUpPressed && !g_WasUpPressed) {
		g_PlayerY -= 1;
		g_MirrorPlayerX = false;
		g_CurrentPlayerAnim = g_PlayerUpFrames;
	}

	if (g_IsDownPressed && !g_WasDownPressed) {
		g_PlayerY += 1;
		g_MirrorPlayerX = false;
		g_CurrentPlayerAnim = g_PlayerDownFrames;		
	}

	// this is the input for the playe
	g_PlayerY = clamp(g_PlayerY, 0, TILE_HEIGHT);
	g_PlayerX = clamp(g_PlayerX, 0, TILE_WIDTH);	

	g_WasLeftPressed = g_IsLeftPressed;
	g_WasRightPressed = g_IsRightPressed;
	g_WasUpPressed = g_IsUpPressed;
	g_WasDownPressed = g_IsDownPressed;
}

function setGameState(new_state) {

	if (new_state == g_GameState)
		return;

	g_GameState = new_state;

	if (new_state == GAME_STATE_PLAYING) {

	} else if (new_state == GAME_STATE_DEAD) {

	}
}

function updatePlayer() {
	g_StateCounter++;

	updatePlayerPos();
}

function drawObjects(ctx) {

}

function drawPlayer(ctx) {

	if (g_CurrentPlayerAnim == null)
		g_CurrentPlayerAnim = g_PlayerDownFrames;

	g_PlayerDrawX += ((g_PlayerX*TILE_SIZE) - g_PlayerDrawX) * 0.1;
	g_PlayerDrawY += ((g_PlayerY*TILE_SIZE) - g_PlayerDrawY) * 0.1;

	var img = findAnimationFrame(g_CurrentPlayerAnim, 0);
	ctx.save();
	var scale_x = g_MirrorPlayerX ? -1.0 : 1;
	ctx.scale(scale_x, 1);
	ctx.drawImage(img,
		(g_PlayerDrawX + (g_MirrorPlayerX ? TILE_SIZE : 0)) * scale_x,
		g_PlayerDrawY,
		img.width,
		img.height
	);
	ctx.restore();

}

function updatePlayerCollisions() {

}

function updateGame() {

	updatePlayer();
	updatePlayerCollisions();
	updateHUD();
}

function drawLoadScreen() {

	var cvs = document.getElementById("cvs");
	var ctx = cvs.getContext('2d');

	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, g_CanvasWidth, g_CanvasHeight);

	ctx.fillStyle = '#FFF';
	ctx.font = '48px ' + GUI_FONT;
	var label = "Loading";

	var w = ctx.measureText(label).width;

	ctx.fillText(label, (cvs.width-w)/2, cvs.height/2+10);
}

function drawEndGame() {
}

function drawBackground(ctx) {

	ctx.fillStyle = '#835C3B'
	ctx.fillRect(0, 0, g_CanvasWidth, g_CanvasHeight);

}

function updateHUD() {
}

function drawHUD(ctx) {

	function do_draw(ctx, offset_x, offset_y, shadow) {

		if (g_GameState == GAME_STATE_PLAYING) {
			var label = 'in GAME_STATE_PLAYING!';
			// var w = ctx.measureText(label).width;

			ctx.fillText(label, 100 + offset_x, 90 + offset_y);
		}
	}

	do_draw(ctx, 1, 1, true);
	do_draw(ctx, 0, 0, false);

}

function drawGame() {

	var cvs = document.getElementById("cvs");

	var ctx = cvs.getContext('2d');

	ctx.imageSmoothingEnabled = false;

	drawBackground(ctx);

	drawPlayer(ctx);
	drawObjects(ctx);

	drawHUD(ctx);		
}

//	addPulser(400,400, [255,0,127], 0.5, 150, 1.2);

function game_LoadAssets() {


	g_PlayerUpFrames = [
		[loadImage('robo_up_0.png'), 10]
	];
	g_PlayerDownFrames = [
		[loadImage('robo_down_0.png'), 10]
	];
	g_PlayerRightFrames = [
		[loadImage('robo_right_0.png'), 10]
	];
	// g_RatShadowImage = loadImage("rat_shadow.png");

	// // load some images
	// g_RatWalkFrames = [
	// 	[loadImage('rat_walk_0.png'), 5], 
	// 	[loadImage('rat_walk_1.png'), 5], 
	// 	[loadImage('rat_walk_2.png'), 5], 
	// 	[loadImage('rat_walk_3.png'), 5], 
	// ];

	// g_RatWalkAnimLength = calcAnimLength(g_RatWalkFrames);

	// g_WinScreen = loadImage("youwin_screen.jpg");

}