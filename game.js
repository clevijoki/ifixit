/*** Begin Shared Stuff ***/


GAME_UPDATE_SPEED = 1/60; // how much time in seconds elapses in each game frame
GAME_RENDER_SPEED = 1/30; // how fast we actually render the screen

ANIMATION_SPEED = 3 * GAME_UPDATE_SPEED;

SPAWN_LABEL = "Spawning";
FONT = "20px Georgia";

GUI_FONT = "Arial";

function timestamp() {
	return Date.now() / 1000;
}

g_CurrentLevel = 1;
g_CalculatedTime = timestamp();

g_IsLeftPressed = false;
g_IsRightPressed = false;
g_IsUpPressed = false;
g_IsDownPressed = false;
g_IsSpacePressed = false;
g_IsXPressed = false;
g_IsZPressed = false;

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

function getRandomInteger(min, max) {
	if (min == max)
		return min;
	return Math.min(max-1, Math.floor(Math.random() * (max - min + 1) ) + min);
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

function findAnimationFrame(frames, counter, loop=true) {

	var current_sum = 0;

	for (var n = 0; n < frames.length; ++n) {

		current_sum += frames[n][1];

		if (counter <= current_sum) {
			return frames[n][0];
		}
	}

	if (loop) {
		return findAnimationFrame(frames, counter % current_sum, false);
	}

	return frames[frames.length-1][0];
}

function findAnimationLength(frames) {

	var current_sum = 0;

	for (var n = 0; n < frames.length; ++n) {
		current_sum += frames[n][1];
	}

	return current_sum;
}

LEFT_KEYCODE = 37;
RIGHT_KEYCODE = 39;
SPACE_KEYCODE = 32;
UP_KEYCODE = 38;
DOWN_KEYCODE = 40;
Z_KEYCODE = 90;
X_KEYCODE = 88;

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

	} else if (e.keyCode == Z_KEYCODE) {
		e.preventDefault();
		g_IsZPressed = true;
	} else if (e.keyCode == X_KEYCODE) {
		e.preventDefault();
		g_IsXPressed = true;
	}
});

document.addEventListener('keyup', function(e) {
	
	if (e.keyCode == LEFT_KEYCODE) {
		e.preventDefault();
		g_IsLeftPressed = false;
	} else if (e.keyCode == RIGHT_KEYCODE) {
		e.preventDefault();
		g_IsRightPressed = false;
	} else if (e.keyCode == UP_KEYCODE) {
		e.preventDefault();
		g_IsUpPressed = false;
	} else if (e.keyCode == DOWN_KEYCODE) {
		e.preventDefault();
		g_IsDownPressed = false;
	} else if (e.keyCode == SPACE_KEYCODE) {
		e.preventDefault();
		g_IsSpacePressed = false;
	} else if (e.keyCode == Z_KEYCODE) {
		e.preventDefault();
		g_IsZPressed = false;
	} else if (e.keyCode == X_KEYCODE) {
		e.preventDefault();
		g_IsXPressed = false;
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

	setInterval(mainLoop, GAME_RENDER_SPEED);
};

/*** End shared stuff ***/

GAME_STATE_LOADING = 0
GAME_STATE_PLAYING = 1
GAME_STATE_DEAD = 2

g_GameState = GAME_STATE_LOADING;
g_AnimFrame = 0;

// this is for animation frames
g_StateCounter = 0

BOARD_WIDTH = 15;
BOARD_HEIGHT = 12;
TILE_SIZE = 40;

// smaller number = more variety faster
JUNK_VARIETY_SCALING = 1;
ORDER_COUNT_SCALING = 2;

CANVAS_WIDTH = TILE_SIZE * BOARD_WIDTH;
CANVAS_HEIGHT = TILE_SIZE * BOARD_HEIGHT;
g_Board = [];
g_DeliveryObjects = [];

DIR_UP = 0
DIR_LEFT = 1
DIR_DOWN = 2
DIR_RIGHT = 3
DIR_MAX = DIR_RIGHT

OBJID_PLAYER = 0;

OBJID_COUCH = 1;
OBJID_TV = 2;
OBJID_LAMP = 3;
OBJID_SQIGGLE = 4;
OBJID_GASTANK = 5;
OBJID_TSHAPE = 6;

OBJID_JUNK_BEGIN = OBJID_COUCH;
OBJID_JUNK_END = OBJID_TSHAPE;

g_JunkVariety = 6;

g_SpawnJunkCounter = 0;

g_CurrentOrder = 1;
g_CurrentOrderObjId = OBJID_COUCH;
g_CurrentOrderDifficulty = 0;

g_UniquePieceId = 0;
g_JunkTemplates = {};
g_InputCount = 0;

g_PuffFrames = [];
g_Puffs = [];

g_Score = 0;
g_AddScore = 0;
g_AddScoreTimer = 0;

g_HasRequiredParts = true;

g_Player = {
	objId: OBJID_PLAYER,
	x: 5,
	y: 5,
	drawX: 5 * TILE_SIZE,
	drawY: 5 * TILE_SIZE,
	currentFrame: 0,
	direction: DIR_DOWN,
	upFrames: [],
	rightFrames: [],
	downFrames: [],
	inputRepeatCounter: 0,
	wasLeftPressed: false,
	wasRightPressed: false,
	wasUpPressed: false,
	wasDownPressed: false,
	wasSpacePressed: false,
	wasZPressed: false,
	wasXPressed: false,
	updateFn: null,
	drawFn: drawPlayer,
	shakeFrames: 0,
	heldObjects: [],
};

g_JunkQueue = []; // the queue of items to drop

function canMoveTo(new_x, new_y) {
	if (new_x < 0)
		return false;
	if (new_y < 0)
		return false;
	if (new_x >= BOARD_WIDTH)
		return false;
	if (new_y >= BOARD_HEIGHT)
		return false;
	if (g_Board[new_x+new_y*BOARD_WIDTH] != null)
		return false;

	return true;
}

MOVE_INVALID = 0
MOVE_VALID = 1
MOVE_DELIVERY = 2

function tryMoveTo(obj, new_x, new_y, new_dir) {

	if (g_CurrentOrderObjId == obj.objId
		&& obj.isFixed
		&& new_x >= 0
		&& new_x < BOARD_WIDTH
		&& new_y == BOARD_HEIGHT) {

		obj.deliveryX = new_x;
		obj.deliveryY = new_y;

		return MOVE_DELIVERY;
	}

	if (!canMoveTo(new_x, new_y))
		return MOVE_INVALID;

	if (g_Board[obj.x+obj.y*BOARD_WIDTH] == obj)
		g_Board[obj.x+obj.y*BOARD_WIDTH] = null;

	obj.x = new_x;
	obj.y = new_y;
	obj.direction = new_dir;
	g_Board[new_x+new_y*BOARD_WIDTH] = obj;

	return MOVE_VALID;
}

function drawJunk(ctx, junk, tile_x, tile_y) {

	junk.drawX += ((tile_x*TILE_SIZE) - junk.drawX) * 0.1;
	junk.drawY += ((tile_y*TILE_SIZE) - junk.drawY) * (junk.isDelivered ? 0.01 : 0.1);

	var img = findAnimationFrame(junk.isFixed ? junk.fixedFrames : junk.brokenFrames, g_AnimFrame);
	ctx.save();

	if (junk.direction == DIR_RIGHT) {
		ctx.translate(junk.drawX + TILE_SIZE, junk.drawY);
		ctx.rotate(Math.PI/2);
	} else if (junk.direction == DIR_DOWN) {
		ctx.translate(junk.drawX + TILE_SIZE, junk.drawY + TILE_SIZE);
		ctx.rotate(Math.PI);
	} else if (junk.direction == DIR_LEFT) {
		ctx.translate(junk.drawX, junk.drawY + TILE_SIZE	);
		ctx.rotate(-Math.PI/2);
	} else {
		ctx.translate(junk.drawX, junk.drawY);
	}

	ctx.fillStyle = '#FF0000';

	ctx.drawImage(
		img,
		junk.tileX * TILE_SIZE,
		junk.tileY * TILE_SIZE,
		TILE_SIZE,
		TILE_SIZE,
		0,
		0,
		TILE_SIZE,
		TILE_SIZE
	);

	ctx.restore();
}

// returns all of the objects necessry to create the junk
function createJunk(id) {

	var template = g_JunkTemplates[id];

	var res = []

	for (var piece_idx = 0; piece_idx < template.pieces.length; ++piece_idx) {
		res.push({
			id: id,
			piece: template.pieces[piece_idx]
		});
	}

	return res;
}

function isPieceComplete(x, y) {
	return false;
}

function getConnectedObjects(px, py, push_x, push_y, ignore=[]) {

	var result = [];

	var result_points = [];

	if (px > 0 && py > 0 && px < BOARD_WIDTH || py < BOARD_HEIGHT) {
		var obj_to_hold = g_Board[px + py * BOARD_WIDTH];
		if (obj_to_hold != null) {
			for (var n = 0; n < g_Board.length; ++n) {
				if (g_Board[n] == null)
					continue;

				if (obj_to_hold.uniqueId == g_Board[n].uniqueId && ignore.indexOf(g_Board[n]) == -1) {
					result.push(g_Board[n]);

					result_points.push([Math.floor(n % BOARD_WIDTH), Math.floor(n / BOARD_WIDTH)]);
				}
			}
		}
	}

	if (push_x == 0 && push_y == 0) {
		return result;
	}

	// also try and get all connected objects

	for (var res_idx = 0; res_idx < result_points.length; ++res_idx) {

		var p = result_points[res_idx];

		var push_obj = getConnectedObjects(p[0] + push_x, p[1] + push_y, push_x, push_y, result);
		result = result.concat(push_obj);
	}

	const unique = (value, index, self) => {
		return self.indexOf(value) == index;
	};

	return result.filter(unique);
}

function updatePlayerPos() {

	if (g_IsLeftPressed || g_IsRightPressed || g_IsUpPressed || g_IsDownPressed) {
		g_Player.inputRepeatCounter++;
	} else {
		g_Player.inputRepeatCounter = -5;
	}

	if (g_Player.inputRepeatCounter > 7) {
		g_Player.wasLeftPressed = false;
		g_Player.wasRightPressed = false;
		g_Player.wasUpPressed = false;
		g_Player.wasDownPressed = false;
		g_Player.inputRepeatCounter = 0;
	}

	var new_x = g_Player.x;
	var new_y = g_Player.y;
	var new_dir = g_Player.direction;

	var manip_objects = []

	if (g_IsLeftPressed && !g_Player.wasLeftPressed) {
		new_x -= 1;

		if (g_Player.heldObjects.length == 0)
			new_dir = DIR_LEFT;
	}

	if (g_IsRightPressed && !g_Player.wasRightPressed) {
		new_x += 1;
		if (g_Player.heldObjects.length == 0)
			new_dir = DIR_RIGHT;
	}

	if (new_x == g_Player.x) {

		if (g_IsUpPressed && !g_Player.wasUpPressed) {
			new_y -= 1;
			if (g_Player.heldObjects.length == 0)
				new_dir = DIR_UP;
		}

		if (g_IsDownPressed && !g_Player.wasDownPressed) {
			new_y += 1;
			if (g_Player.heldObjects.length == 0)
				new_dir = DIR_DOWN;
		}

		if (new_y == g_Player.y) {
			if (g_IsZPressed && !g_Player.wasZPressed) {
				new_dir += 1;
				if (new_dir > DIR_MAX)
					new_dir = 0;
			}

			if (g_IsXPressed && !g_Player.wasXPressed) {
				new_dir -= 1;
				if (new_dir == -1)
					new_dir = DIR_MAX;
			}			
		}
	}

	var apply_rotation = false;
	if (new_x != g_Player.x || new_y != g_Player.y) {

		manip_objects = getConnectedObjects(new_x, new_y, new_x-g_Player.x, new_y-g_Player.y);

	} else {
		// find something to pickup
		var px = g_Player.x, py = g_Player.y;
		if (g_Player.direction == DIR_UP) {
			py += -1;
		} else if (g_Player.direction == DIR_DOWN) {
			py += 1;
		} else if (g_Player.direction == DIR_LEFT) {
			px += -1;
		} else {
			px += 1;
		}

		manip_objects = getConnectedObjects(px, py, 0, 0);
		apply_rotation = true;
	}

	if (new_x != g_Player.x || new_y != g_Player.y || new_dir != g_Player.direction) {
		var px = g_Player.x;
		var py = g_Player.y;
		var direction_delta = 0;

		if (new_dir != g_Player.direction && apply_rotation) {

			if (new_dir == 0 && g_Player.direction == DIR_MAX) {
				direction_delta = 1;
			} else if (new_dir == DIR_MAX && g_Player.direction == 0) {
				direction_delta = -1;
			} else {
				direction_delta = new_dir - g_Player.direction;
			}
		}

		g_Player.backupDir = g_Player.direction;

		var board_backup = g_Board.slice();
		var delivery_backup = g_DeliveryObjects.slice();

		// remove our target objects from the board
		g_Board[g_Player.x + g_Player.y * BOARD_WIDTH] = null;
		for (var h = 0; h < manip_objects.length; ++h) {
			var obj = manip_objects[h];

			obj.backupDir = obj.direction;
			obj.backupDrawX = obj.drawX;
			obj.backupDrawY = obj.drawY;

			g_Board[obj.x + obj.y*BOARD_WIDTH] = null;
		}

		var can_move = tryMoveTo(g_Player, new_x, new_y, new_dir) == MOVE_VALID;
		var delivery_ids = [];

		for (var h = 0; h < manip_objects.length && can_move; ++h) {
			var obj = manip_objects[h];

			var ox = obj.x - px;
			var oy = obj.y - py;

			var nx = new_x + ox;
			var ny = new_y + oy;
			var nd = obj.direction;

			if (direction_delta == -1) { // rotate right
				nx = new_x - oy;
				ny = new_y + ox;
				nd -= 1;

				if (nd < 0) 
					nd = DIR_MAX;

			} else if (direction_delta == 1) { // rotate left
				nx = new_x + oy;
				ny = new_y - ox;

				nd += 1;
				if (nd > DIR_MAX)
					nd = 0;
			}

			var res_move = tryMoveTo(obj, nx, ny, nd);

			if (res_move == MOVE_INVALID)
				can_move = false;

			if (direction_delta != 0) {
				obj.drawX = obj.x*TILE_SIZE;
				obj.drawY = obj.y*TILE_SIZE; 
			}

			if (res_move == MOVE_DELIVERY) {
				g_DeliveryObjects.push(obj);
				obj.isDelivered = true;

				if (delivery_ids.indexOf(obj.uniqueId) == -1) {
					delivery_ids.push(obj.uniqueId);
					g_AddScore = obj.template.value;
					g_AddScoreTimer = 0;
					g_Score += g_AddScore;
				}

			}
		}

		if (!can_move) {
			g_Board = board_backup;
			g_DeliveryObjects = delivery_backup;
			g_Player.shakeFrames = 30;

			// reset ensure positions match
			for (var y = 0; y < BOARD_HEIGHT; ++y) {
				for (var x = 0; x < BOARD_WIDTH; ++x) {
					var obj = g_Board[x + y*BOARD_WIDTH];
					if (obj == null)
						continue;

					obj.x = x;
					obj.y = y;
				}
			}

			g_Player.direction = g_Player.backupDir;

			if (!apply_rotation) {
				g_Player.direction = new_dir;
			}

			for (var h = 0; h < manip_objects.length; ++h) {
				var ho = manip_objects[h];

				ho.direction = ho.backupDir;
				ho.drawX = ho.backupDrawX;
				ho.drawY = ho.backupDrawY;
			}
		} else {

			addPuff(px, py);

			if (delivery_ids.length != 0) {

				const unique = (value, index, self) => {
					return self.indexOf(value) == index;
				};

				delivery_ids = delivery_ids.filter(unique);

				// perform deliveries
				for (var del_idx = 0; del_idx < delivery_ids.length; ++del_idx) {
					var delivery_id = delivery_ids[del_idx];

					for (var by = 0; by < BOARD_HEIGHT; ++by) {
						for (var bx = 0; bx < BOARD_WIDTH; ++bx) {
							var bidx = bx+by*BOARD_WIDTH;
							var bobj = g_Board[bidx];
							if (bobj == null)
								continue;

							if (bobj.uniqueId == delivery_id) {
								g_DeliveryObjects.push(bobj);
								bobj.isDelivered = true;
								bobj.deliveryX = bx;
								bobj.deliveryY = by;
								g_Board[bidx] = null;
							}
						}
					}

					g_CurrentOrder--;
					if (g_CurrentOrder == 0) {
						g_CurrentOrderDifficulty++;
						g_CurrentOrder = 1 + Math.floor(g_CurrentOrderDifficulty/ORDER_COUNT_SCALING);

						var available = [];

						// find all pieces and randomly select one to find the next order count
						for (var n = 0 ; n < g_Board.length; ++n) {

							var obj = g_Board[n];
							if (obj == null || obj.objId == OBJID_PLAYER)
								continue;

							available.push(obj.objId); 
						}

						g_CurrentOrderObjId = getRandomArrayEntry(available);
					}

					return true;
				}
			}
		}
	}

	g_Player.wasLeftPressed = g_IsLeftPressed;
	g_Player.wasRightPressed = g_IsRightPressed;
	g_Player.wasUpPressed = g_IsUpPressed;
	g_Player.wasDownPressed = g_IsDownPressed;
	g_Player.wasXPressed = g_IsXPressed;
	g_Player.wasZPressed = g_IsZPressed;
	g_Player.wasSpacePressed = g_IsSpacePressed;
}

g_LastRandomJunkId = -1;
g_ForceOrderTypeMatchCount = 0;

function getRandomJunkId(filter) {

	if (filter && g_ForceOrderTypeMatchCount > 2) {
		g_ForceOrderTypeMatchCount = 0;
		g_LastRandomJunkId = g_CurrentOrderObjId;
		return g_CurrentOrderObjId;
	}

	var loop = 0;
	while (true) {
		var res = getRandomInteger(OBJID_JUNK_BEGIN, Math.min(OBJID_JUNK_END+1, OBJID_JUNK_BEGIN+Math.floor(g_JunkVariety/JUNK_VARIETY_SCALING)));

		if (!filter) {

			if (res == g_CurrentOrderObjId)
				g_ForceOrderTypeMatchCount = 0;
			else
				g_ForceOrderTypeMatchCount++;

			return res;
		}

		if (res == g_LastRandomJunkId && ++loop < 10)
			continue;

		g_LastRandomJunkId = res;

		if (res == g_CurrentOrderObjId)
			g_ForceOrderTypeMatchCount = 0;
		else
			g_ForceOrderTypeMatchCount++;

		return res;
	}
}

function queueJunk(count) {

	for (var n = 0; n < count; ++n) {

		var new_junk = createJunk(getRandomJunkId(true));

		for (var j = 0; j < new_junk.length; ++j) {
			g_JunkQueue.push(new_junk[j]);
		}
	}

	g_JunkVariety++;
}

function setGameState(new_state) {

	if (new_state == g_GameState)
		return;

	g_GameState = new_state;

	if (new_state == GAME_STATE_PLAYING) {

		g_Board = [];

		for (var n = 0; n < BOARD_WIDTH*BOARD_HEIGHT; ++n) {
			g_Board.push(null);	
		}

		tryMoveTo(g_Player, 5, 5, DIR_DOWN);

		g_Player.drawX = g_Player.x*TILE_SIZE;
		g_Player.drawY = g_Player.y*TILE_SIZE;

		queueJunk(7);

	} else if (new_state == GAME_STATE_DEAD) {

	}
}

function updatePlayer() {
	g_StateCounter++;

	updatePlayerPos();
}

function drawPuff(ctx, obj) {

	ctx.drawImage(
		obj.frame,
		obj.x,
		obj.y,
		obj.frame.width/2,
		obj.frame.height/2,
	);
}

function updatePuffs() {

	var new_puffs = [];
	for (var puff_idx = 0; puff_idx < g_Puffs.length; ++puff_idx) {

		var puff = g_Puffs[puff_idx];

		if (puff.animCounter++ > puff.maxFrames) {
			continue;
		}

		puff.frame = findAnimationFrame(g_PuffFrames, puff.animCounter, false);
		new_puffs.push(puff);
	}

	g_Puffs = new_puffs;
}

function addPuff(tile_x, tile_y) {
	g_Puffs.push({
		frame: findAnimationFrame(g_PuffFrames, 0, false),
		maxFrames: findAnimationLength(g_PuffFrames),
		animCounter: 0,
		x: tile_x * TILE_SIZE - 15,
		y: tile_y * TILE_SIZE - 15
	});
}

function drawObjects(ctx) {

	var cb_frame = findAnimationFrame(g_ConveryBeltFrames, g_AnimFrame);
	ctx.drawImage(
		cb_frame,
		45,
		g_BackgroundImg.height-cb_frame.height+50);

	ctx.save();
	ctx.translate(100, 100);

	ctx.globalAlpha = 0.5;
	// draw puffs under
	for (var n = 0; n < g_Puffs.length; ++n) {
		drawPuff(ctx, g_Puffs[n]);
	}

	for (var y = 0; y < BOARD_HEIGHT; ++y) {
		var shadow_stride = 0;
		var shadow_id = -1;
		var shadow_draw_x = 0;
		var shadow_draw_y = 0;

		for (var x = 0; x < BOARD_WIDTH; ++x) {
			var obj = g_Board[x + y * BOARD_WIDTH];

			var obj_id = obj == null ? -1 : obj.uniqueId;

			var below_obj = y < (BOARD_HEIGHT-1) ? g_Board[x + (y+1) * BOARD_WIDTH] : null;
			var below_obj_id = below_obj ? below_obj.uniqueId : -1;

			if (below_obj_id == obj_id)
				obj_id = -1;

			if (obj_id == shadow_id && below_obj_id != obj_id) {
				shadow_stride++;
			} else {
				if (shadow_id != -1) {
					ctx.drawImage(
						g_ShadowImage,
						shadow_draw_x,
						shadow_draw_y + TILE_SIZE - 10,
						shadow_stride * TILE_SIZE,
						16
					);
				}
				shadow_id = obj_id;
				shadow_stride = 1;
				shadow_draw_x = obj == null ? 0 : obj.drawX;
				shadow_draw_y = obj == null ? 0 : obj.drawY;

			}
		}

		if (shadow_id != -1) {
			ctx.drawImage(
				g_ShadowImage,
				shadow_draw_x,
				shadow_draw_y + TILE_SIZE - 10,
				shadow_stride * TILE_SIZE,
				16
			);
		}

	}

	ctx.globalAlpha = 1;

	for (var y = 0; y < BOARD_HEIGHT; ++y) {
		for (var x = 0; x < BOARD_WIDTH; ++x) {

			var obj = g_Board[x + y * BOARD_WIDTH];

			if (obj == null)
				continue;

			obj.drawFn(ctx, obj, x, y);
		}
	}

	// draw delivery objects

	var new_delivery_objects = [];
	for (var n = 0; n < g_DeliveryObjects.length; ++n) {
		var obj = g_DeliveryObjects[n];
		obj.drawFn(ctx, obj, obj.deliveryX, obj.deliveryY+6);

		if (obj.drawY < g_BackgroundImg.height)
			new_delivery_objects.push(obj);
	}

	g_DeliveryObjects = new_delivery_objects;

	ctx.restore();
}

function drawPlayer(ctx, p, tile_x, tile_y) {
	p.drawX += ((p.x*TILE_SIZE) - p.drawX) * 0.1;
	p.drawY += ((p.y*TILE_SIZE) - p.drawY) * 0.1;

	var use_anims = null;
	if (p.direction == DIR_LEFT || p.direction == DIR_RIGHT) {
		use_anims = p.rightFrames;
	} else if (p.direction == DIR_UP) {
		use_anims = p.upFrames;
	} else {
		use_anims = p.downFrames;
	}

	var img = findAnimationFrame(use_anims, g_AnimFrame);
	ctx.save();
	var scale_x = (p.direction == DIR_LEFT) ? -1.0 : 1;
	ctx.scale(scale_x, 1);
	ctx.drawImage(img,
		(p.drawX + (p.direction == DIR_LEFT ? TILE_SIZE : 0)) * scale_x,
		p.drawY,
		img.width,
		img.height
	);
	ctx.restore();
}

function updatePlayerCollisions() {

}

function rotationX(d, x, y) {
	if (d == DIR_UP) {
		return x;
	} else if (d == DIR_DOWN) {
		return -x;
	} else if (d == DIR_LEFT) {
		return y;
	} else if (d == DIR_RIGHT) {
		return -y;
	}
}

function rotationY(d, x, y) {
	if (d == DIR_UP) {
		return y;
	} else if (d == DIR_DOWN) {
		return -y;
	} else if (d == DIR_LEFT) {
		return -x;
	} else if (d == DIR_RIGHT) {
		return x;
	}
}

function checkTileEq(x, y, objid, junk_fragment_idx, direction) {
	if (x < 0 || y < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT)
		return false;

	var obj = g_Board[x + y * BOARD_WIDTH];
	if (obj == null || obj.objId != objid)
		return false;

	if (obj.junkFragmentIdx != junk_fragment_idx)
		return false;

	if (obj.direction != direction)
		return false;

	return true;
}

function updateJunkState() {
	var is_everything_fixed = true;

	g_HasRequiredParts = false;

	for (var y = 0; y < BOARD_HEIGHT; ++y) {
		for (var x = 0; x < BOARD_WIDTH; ++x) {

			var obj = g_Board[x + y * BOARD_WIDTH];
			if (obj == null || obj.objId == OBJID_PLAYER)
				continue;

			if (obj.objId == g_CurrentOrderObjId)
				g_HasRequiredParts = true;

			if (obj.isFixed)
				continue;


			var tile_idx = x+y*BOARD_WIDTH;

			// find 

			var dxx, dxy, dyx, dyy;

			if (obj.direction == DIR_UP) {
				dxx = dyy = 1;
				dxy = dyx = 0;
			} else if (obj.direction == DIR_RIGHT) {
				dxx = dyy = 0;
				dxy = 1;
				dyx = -1;
			} else if (obj.direction == DIR_LEFT) {
				dxx = dyy = 0;
				dyx = 1;
				dxy = -1;
			} else if (obj.direction == DIR_DOWN) {
				dxx = -1;
				dxy = dyx = 0;
				dyy = -1;
			}

			var frag_x = Math.floor(obj.junkFragmentIdx % obj.template.stride);
			var frag_y = Math.floor(obj.junkFragmentIdx / obj.template.stride);

			var is_fixed = true;

			var fixed_pieces = [];

			for (var piece_idx = 0; piece_idx < obj.template.pieces.length && is_fixed; ++piece_idx) {
				var pieces = obj.template.pieces[piece_idx];

				for (var frag_idx = 0; frag_idx < pieces.length; ++frag_idx) {

					var frag_xo = Math.floor(pieces[frag_idx] % obj.template.stride) - frag_x;
					var frag_yo = Math.floor(pieces[frag_idx] / obj.template.stride) - frag_y;

					var check_x = x + dxx * frag_xo + dyx * frag_yo;
					var check_y = y + dxy * frag_xo + dyy * frag_yo;

					if (!checkTileEq(
						check_x,
						check_y,
						obj.objId,
						pieces[frag_idx],
						obj.direction)) {
						is_fixed = false;
						break;
					}

					fixed_pieces.push(g_Board[check_x + check_y * BOARD_WIDTH]);
				}
			} 

			if (is_fixed) {
				var first_unique_id = obj.uniqueId;
				for (var piece_idx = 0; piece_idx < fixed_pieces.length; ++piece_idx) {
					fixed_pieces[piece_idx].isFixed = true;
					fixed_pieces[piece_idx].uniqueId = obj.uniqueId;
				}

				queueJunk(1); // always queue one more for each completed item

				// TODO: play sparkles?
			} else {
				is_everything_fixed = false;
			}
		}
	}
}

function spawnJunk() {

	if (g_JunkQueue.length == 0)
		return;

	// try to place the top piece randomly once per frame

	var j = g_JunkQueue[0];

	var x = getRandomInteger(0, BOARD_WIDTH);
	var y = getRandomInteger(0, BOARD_HEIGHT);
	var d = getRandomInteger(0, DIR_MAX+1);

	var template = g_JunkTemplates[j.id];

	for (var pidx = 0; pidx < j.piece.length; ++pidx) {
		// ensure all pieces can be placed
		var idx = j.piece[pidx];

		var tile_x = Math.floor(idx % template.stride);
		var tile_y = Math.floor(idx / template.stride);

		var px = x + rotationX(d, tile_x, tile_y);
		var py = y + rotationY(d, tile_x, tile_y);

		if (!canMoveTo(px, py))
			return;
	}

	for (var pidx = 0; pidx < j.piece.length; ++pidx) {
		var idx = j.piece[pidx];

		var tile_x = Math.floor(idx % template.stride);
		var tile_y = Math.floor(idx / template.stride);

		var px = x + rotationX(d, tile_x, tile_y);
		var py = y + rotationY(d, tile_x, tile_y);

		g_Board[px + py*BOARD_WIDTH] = {
			objId: j.id,
			x: px,
			y: py,
			drawX: px * TILE_SIZE,
			drawY: py * TILE_SIZE - 1000,
			tileX: tile_x,
			tileY: tile_y,
			brokenFrames: template.brokenFrames,
			fixedFrames: template.fixedFrames,
			drawFn: drawJunk,
			uniqueId : g_UniquePieceId,
			direction: d,
			isFixed: false,
			template: template,
			junkFragmentIdx: idx,
			isDelivered: false,
		};
	}

	g_UniquePieceId++;
	g_JunkQueue.shift();

}

function updateGame() {
	setGameState(GAME_STATE_PLAYING);

	g_AnimFrame ++;

	spawnJunk();
	updatePlayer();
	updateJunkState();
	updatePlayerCollisions();
	updateHUD();
	updatePuffs();
}

function drawLoadScreen() {
	var cvs = document.getElementById("cvs");
	var ctx = cvs.getContext('2d');

	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	ctx.fillStyle = '#FFF';
	ctx.font = '48px ' + GUI_FONT;
	var label = "Loading";

	var w = ctx.measureText(label).width;

	ctx.fillText(label, (cvs.width-w)/2, cvs.height/2+10);
}

function drawEndGame() {
}

function drawBackground(ctx) {
	ctx.drawImage(g_BackgroundImg, 0, 0);
}

function updateHUD() {
}

function drawHUD(ctx) {

	g_AddScoreTimer++;

	function do_draw(ctx, offset_x, offset_y, shadow) {

		if (g_GameState == GAME_STATE_PLAYING) {
			ctx.font = '28px ' + GUI_FONT;
			ctx.fillStyle = shadow ? '#FF0' : '#FFF';

			var label0 = 'Deliver:';
			var label0_dim = ctx.measureText(label0);
			var label1 = 'x' + g_CurrentOrder;
			var label1_dim = ctx.measureText(label1);

			var order_template = g_JunkTemplates[g_CurrentOrderObjId];
			var img = order_template.fixedFrames[0][0];

			var img_height = img.height;
			var img_width = img.width;

			if (img_height > 80) {
				img_width = Math.floor(img_width*80.0/img_height);
				img_height = 80;
			}

			var total_width = label0_dim.width + label1_dim.width + img_width;
			var left = (g_BackgroundImg.width - total_width)/2;

			ctx.fillText(label0, left, g_BackgroundImg.height - 24);
			ctx.fillText(label1, left + label0_dim.width + img_width, g_BackgroundImg.height - 24);

			if (!shadow) {

				ctx.drawImage(
					img,
					left + label0_dim.width,
					g_BackgroundImg.height - 10 - img_height,
					img_width,
					img_height
				);
			}

			if (!g_HasRequiredParts)
			{
				var req_label = "Fix more stuff to get the parts you need!";
				var req_w = ctx.measureText(req_label).width;
				ctx.fillStyle = shadow ? '#700' : '#FFF';

				ctx.fillText(req_label, (g_BackgroundImg.width-req_w)/2, g_BackgroundImg.height-65);
			}

			// draw score
			{
				var score_label = "" + g_Score + " RoboBux";
				var score_w = ctx.measureText(score_label).width;
				ctx.fillStyle = shadow ? '#770' : '#FFF';
				ctx.fillText(score_label, g_BackgroundImg.width-score_w - 40, 40);
			}

			if (g_AddScore != 0 && g_AddScoreTimer < 200) {
				var add_score_label = "+" + g_AddScore + " RoboBux!";
				ctx.font = '48px ' + GUI_FONT;
				var add_score_label_w = ctx.measureText(add_score_label).width;

				ctx.globalAlpha = Math.min(1, g_AddScoreTimer/100.0);

				ctx.fillStyle = shadow ? '#770' : '#FFF';
				ctx.fillText(add_score_label, (g_BackgroundImg.width-add_score_label_w)/2, 500-Math.floor(g_AddScoreTimer*0.3));
				ctx.globalAlpha = 1;
			}
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
	drawObjects(ctx);

	drawHUD(ctx);		
}

//	addPulser(400,400, [255,0,127], 0.5, 150, 1.2);

function game_LoadAssets() {

	g_BackgroundImg = loadImage('bg.png');

	g_ShadowImage = loadImage('shadow.png');

	g_Player.upFrames = [
		[loadImage('Robo_Back_View.png'), 20],
		[loadImage('Robo_Back_Hold.png'), 10],
	];
	g_Player.downFrames = [
		[loadImage('Robo_Front_View.png'), 20],
		[loadImage('Robo_Front_Hold.png'), 10],
	];
	g_Player.rightFrames = [
		[loadImage('Robo_Side_View.png'), 20],
		[loadImage('Robo_Side_Hold.png'), 10],
	];

	g_JunkTemplates[OBJID_COUCH] = {
		stride: 2,
		brokenFrames: [[loadImage('couch_broken.png'), 1]],
		fixedFrames: [[loadImage('couch_fixed.png'), 1]],
		pieces: [
			[0],
			[1]
		],
		value:1
	};

	g_JunkTemplates[OBJID_LAMP] = {
		stride: 1,
		brokenFrames: [[loadImage('lamp_broken.png'), 1]],
		fixedFrames: [[loadImage('lamp_fixed.png'), 1]],
		pieces: [
			[0],
			[1]
		],
		value:5
	}

	g_JunkTemplates[OBJID_TV] = {
		stride: 1,
		brokenFrames:[[loadImage('tv_broken.png'), 1]],
		fixedFrames:[
			[loadImage('tv_fixed_1.png'), 10],
			[loadImage('tv_fixed_2.png'), 10],
			[loadImage('tv_fixed_1.png'), 15],
			[loadImage('tv_fixed_2.png'), 20],
		],
		pieces: [
			[0],
			[1]
		],
		value:10
	}
	
	g_JunkTemplates[OBJID_SQIGGLE] = {
		stride: 2,
		brokenFrames:[[loadImage('charger_broken.png'), 1]],
		fixedFrames:[
			[loadImage('charger_fixed_0.png'), 10],
			[loadImage('charger_fixed_1.png'), 10],
		],
		pieces: [
			[0, 2],
			[3, 5]
		],
		value:20
	}
	
	g_JunkTemplates[OBJID_GASTANK] = {
		stride: 2,
		brokenFrames:[[loadImage('gas_tank_broken.png'), 1]],
		fixedFrames:[
			[loadImage('gas_tank_fixed_0.png'), 10],
			[loadImage('gas_tank_fixed_1.png'), 10],
			[loadImage('gas_tank_fixed_2.png'), 10],
			],
		pieces: [
			[0, 1],
			[2, 3]
		],
		value: 20
	}
	
	g_JunkTemplates[OBJID_TSHAPE] = {
		stride: 3,
		brokenFrames:[[loadImage('combiner_broken.png'), 1]],
		fixedFrames:[
			[loadImage('combiner_fixed_0.png'), 20],
			[loadImage('combiner_fixed_1.png'), 10],
			[loadImage('combiner_fixed_2.png'), 10],
			[loadImage('combiner_fixed_1.png'), 10],
		],
		pieces: [
			[1, 4],
			[3],
			[5]
		],
		value:25
	}
	

	g_PuffFrames = [
		[loadImage('Puff_Frame_1.png'), 3],
		[loadImage('Puff_Frame_2.png'), 3],
		[loadImage('Puff_Frame_3.png'), 3],
		[loadImage('Puff_Frame_4.png'), 3],
		[loadImage('Puff_Frame_5.png'), 3],
		[loadImage('Puff_Frame_6.png'), 3],
		[loadImage('Puff_Frame_7.png'), 3],
		[loadImage('Puff_Frame_8.png'), 3],
		[loadImage('Puff_Frame_9.png'), 3],
		[loadImage('Puff_Frame_10.png'), 3],
	];

	g_ConveryBeltFrames = [
		[loadImage('cb1.png'), 10],
		[loadImage('cb2.png'), 10],
		[loadImage('cb3.png'), 10],
		[loadImage('cb4.png'), 10],
		[loadImage('cb5.png'), 10],
		[loadImage('cb6.png'), 10],
	];
}