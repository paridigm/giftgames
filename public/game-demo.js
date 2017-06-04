//--------------
var __phaser = {

    gameObj: null,

    //-------------------
    game:{

      //-------------------
      init(canvasEle, appComponent) {

        // customizable features of the game: (type probably should have been an enum, but I got lazy)
        var titleFeature  = {key:'title',  value:'Cloud Adventure',       type:'text',  message:'Let\'s give your gift a title:'};
        var playerFeature = {key:'player', value:'assets/player.png', type:'image', message:'Choose a main character:'};
        var coinFeature   = {key:'coin',   value:'assets/coin.png',   type:'image', message:'What item will your character collect:'};
        var cloudFeature  = {key:'cloud',  value:'assets/cloud.png',  type:'image', message:'Choose what the clouds will be:'};
        
        // publicly accessible feature list:
        this.features = [
          titleFeature,
          playerFeature,
          coinFeature,
          cloudFeature
        ];

        // global vars
        var DEBUG = false;			    // shows colliders and other stuff
        var CAMERA_FOLLOW = true;  	// bug ~ not triggering respawns with this on --> FIXED

        // for randomizing images ( error when loader hasn't actually completed)
        var IMAGES = ['assets/player.png', 'assets/coin.png', 'assets/cloud.png', 'assets/invader.png'];

        // phaser game instance
        var game;

        // game vars
        var startGameFlag = false;
        var startGameTimerFlag = false;
        var startGameTimer = 10;

        var score = 0;

        var numCoins = 5;
        var moveForce = 7;
        var idleForce = 2.4;
        var moveFriciton = 100;
        var coinSpeed = 150;

        var cloudSize = 0.7;
        var cloudSpeed = 70;
        var cloudBaseSpeed = 30;

        // testing string (for DEBUG mode)
        var debugStr;

        // player input 'drivers'
        var up = false;
        var down = false;

        // key bindings
        var upKey;
        var downKey;
        var leftKey;
        var rightKey;

        // mouse var
        var mouseIsDown = false;

        // game objects
        var player;	    // sprite
        var coins;      // group
        var clouds;	    // group
        var scoreText;	// text

        // menu objects
        var menuContainer;
        var menuTargetX;
        var menuTargetY;
        var menuSize;
        var zoomObj;

        var menu0;

        var startText;             // customizable text
        var startButton;           // start button textbox
        var howToButton;           // hot to play button textbox

        // create game, set width/height, set callbacks
        game = new Phaser.Game(700, 480, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });

        // FIX: this is how to assign the gameObj
        __phaser.gameObj = game;

        function preload () {
          game.stage.backgroundColor = '#4286f4';
          game.load.image('player', 'assets/player.png');
          game.load.image('coin',   'assets/coin.png');		   // --> need to change this mapping
          game.load.image('cloud',  'assets/cloud.png');
        }

        function create () {

          // create clouds
          clouds = game.add.group();
          clouds.enableBody = true;
          clouds.physicsBodyType = Phaser.Physics.ARCADE;
          clouds.createMultiple(10, 'cloud', 0, true);	// last param ~ 'exist' = true

          // setup each cloud
          clouds.forEach(function(cloud) {
            // set callback
            cloud.checkWorldBounds = true;
            cloud.events.onOutOfBounds.add(cloudOut, this);

            // init cloud
            cloud.x = game.width * Math.random();
            cloud.y = game.height * Math.random();
            var scale = Math.random()*cloudSize + 0.1;
            cloud.scale.setTo(scale);
            cloud.body.velocity.x = -cloudSpeed*Math.random() - cloudBaseSpeed;
          });

          // load player sprite
          player = game.add.sprite(100, game.world.centerY, 'player');
          player.anchor.setTo(0.5, 0.5);
          player.scale.setTo(-0.2, 0.2);

          // enable physics on player
          game.physics.enable(player, Phaser.Physics.ARCADE);

          // add friction to player
          player.body.drag.y = moveFriciton;

          // setup coins group --> kill() removes from screen, revive brings back
          coins = game.add.group();
          coins.enableBody = true;
          coins.physicsBodyType = Phaser.Physics.ARCADE;
          coins.createMultiple(numCoins, 'coin', 0, true);	// last param ~ 'exist' = true
          coins.setAll('anchor.x', 0.5);
          coins.setAll('anchor.y', 0.5);
          coins.setAll('scale.x', 0.1);
          coins.setAll('scale.y', 0.1);
          coins.setAll('checkWorldBounds', true);
          coins.forEach(function(coin) {
            // add event listener
            coin.events.onOutOfBounds.add(coinOut, this);

            // shrink the collision box slightly
            coin.body.setSize(coin.body.width * 0.8, coin.body.height * 0.8, (1-0.8)*coin.body.width/2, (1-0.8)*coin.body.height/2);
          });

          // set camera to follow if choosen
          if(CAMERA_FOLLOW) {
            // set camera bounds and follow player
            game.world.setBounds(0, -100, 0, 480+200);
            game.camera.follow(player);
            //game.camera.focusOnXY(player.x, player.y);

            // add text box and fix to camera
            var style = { font: "32px Tahoma", fill: "#ff0044", wordWrap: true, wordWrapWidth: 100, align: "center", backgroundColor: "#ffff00" };
            // text = game.add.text(game.width - 10, game.height - 10, "Hello", style);
            // text.anchor.set(1, 1);
            // text.fixedToCamera = true;
          }

          // text styles
          var styleTitle = { font: "80px Tahoma", fill: "#333344", wordWrap: true, wordWrapWidth: 100, align: "center" };
          var styleScore = { font: "24px Tahoma", fill: "#333344", wordWrap: true, wordWrapWidth: 100, align: "center" };
          var styleButton = { font: "32px Tahoma", fill: "#ff0044", wordWrap: true, wordWrapWidth: 100, align: "center", backgroundColor: "#ffff00" };

          // add text box to show score (eventually)
          scoreText = game.add.text(game.width/2, 1, "0", styleScore);
          scoreText.anchor.set(0.5, 0);
          scoreText.fixedToCamera = true;

          /////// Menus ////////
          menuTargetX = menuTargetY = 0;
          menuContainer = game.add.group();
          menuContainer.fixedToCamera = true;
          menuContainer.cameraOffset.x = game.width;

          menu0 = game.add.group();

          // add text box to show score (eventually)
          startText = game.add.text(game.width/2, game.height/2, titleFeature.value, styleTitle);
          startText.anchor.set(0.5, 0.9);

          // start button
          startButton = game.add.text(game.width/2, game.height*(2/3), "START", styleButton);
          startButton.anchor.set(0.5, 0.5);
          startButton.inputEnabled = true;                      // needed to allow touch events
          startButton.events.onInputDown.add(moveMenu, this);

          menu0.add(startText);
          menu0.add(startButton);

          menuContainer.add(menu0);
          ///////////////

          ////// Feature Bindings ////////
          // custom 'feature_' properties to gameObjects that don't have keys by default
          startText.feature_ = titleFeature;

          // add key bindings
          upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
          downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
          leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
          rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

          // add important listeners
          game.load.onLoadComplete.add(loadComplete, this);	// asset loading
          game.input.onTap.add(mouseTap);			// screen taps
          game.input.onDown.add(mouseDown);		// screen taps
          game.input.onUp.add(mouseUp);				// screen taps

          // ********** test ************
          console.log( player.key );

          console.log( "WORLD: ");
          console.log( game.world );
          console.log( "***********");

        }

        function updateScore() {
          scoreText.text = score;
        }

        function resetGame() {
          score = 0;
          updateScore();
          startGameFlag = false;
          startGameTimerFlag = false;
          startGameTimer = 10;
          menuTargetX = menuTargetY = 0;
          coins.forEach(function(coin) {
            coin.x = game.width*2;
            coin.body.velocity.x = 0;
          });
          player.x = 100;
          player.y = game.world.centerY;
        }

        function startGame() {
          startGameTimerFlag = true;
          var i = 0;
          coins.forEach(function(coin) {
            // set position/velocity
            coin.x = (i++)*50 + game.width;
            coin.y = (i)*50 + 100;
            coin.body.velocity.x = -coinSpeed;
          });
        }

        function moveMenu() {
          menuTargetX -= game.width;
          startGame();
        }

        function update() {

          if(startGameTimer > 0 && startGameTimerFlag) {
            startGameTimer--;
            if(startGameTimer <= 0) { startGameFlag = true; }
          }

          // input driver handling
          up = false;
          down = false;
          if(mouseIsDown) {
            var mouseX = game.input.x / game.width;
            var mouseY = game.input.y / game.height;
            var playerY_cam = (player.y - game.camera.y - game.height/2)/(game.height) + 0.5;

            if(Math.abs(mouseY - playerY_cam) > 0.14) {
              if(mouseY > playerY_cam) { down = true; }else{ up = true; }
            }
          }
          if(  upKey.isDown ||  leftKey.isDown) { up = true;   }
          if(downKey.isDown || rightKey.isDown) { down = true; }

          // input handling (put these into handler functions w/ global booleans)
          if(startGameFlag) {
          if( up )        { player.body.velocity.y -= moveForce; }
          else if( down ) { player.body.velocity.y += moveForce; }
          else 			{ /*player.body.velocity.y += idleForce;*/  }
          }

          // rotate
          player.rotation = player.body.velocity.y/500;

          // reset velocity for boundaries
          if(player.y > 470) {
            player.body.velocity.y -= (player.y - 470)/10;
          }

          if(player.y < -20) {
            player.body.velocity.y -= (player.y + 20)/10;
          }

          // zoom menu
          var mo = menuContainer.cameraOffset;
          zoomObj = zoom(zoomObj, mo.x, mo.y, menuTargetX, menuTargetY, 0.03, 0.85, 100);
          mo.x += zoomObj.vx;
          mo.y += zoomObj.vy;

          // collision checks
          game.physics.arcade.overlap(player, coins, playerHitCoin, null, this);

          // respawn checks (workaround for camera following issue)
          clouds.forEach( function(cloud) { if(cloud.x < -cloud.width) {respawnCloud(cloud);} } );
          coins.forEach( function(coin) { if(coin.x < -coin.width) {respawnCoin(coin);} } );
        }

        function render() {

          if(DEBUG) {

            // Camera debug
            game.debug.cameraInfo(game.camera, 32, 32);

            // window width (game dimensions)
            game.debug.text('game.height: ' + game.height, 500, 80);
            game.debug.text('window.outerHeight: ' + window.outerHeight, 500, 100);  // window is the actual browser window
            game.debug.text('window.innerHeight: ' + window.innerHeight, 500, 120);

            // some random values
            game.debug.text('value : ' + game.width + " " + player.body.position, 100, 350);

            // physics bodies debug
            game.debug.body(player);
            coins.forEach(function(coin) {
              game.debug.body(coin);
            });

            // testing
            game.debug.text('DEBUG: ' + debugStr, 100, 400);
            debugStr = "";
          }

        }

        function mouseDown() {
          mouseIsDown = true;
        }

        function mouseUp() {
          mouseIsDown = false;
        }

        function mouseTap() {
        }

        function playerHitCoin(player, coin) {
          respawnCoin(coin);
          score++;
          updateScore();
        }

        function coinOut(coin) {
          respawnCoin(coin);
        }

        function respawnCoin(coin) {
          coin.x = game.width + 200*Math.random();
          coin.y = game.height*Math.random();
        }

        function cloudOut(cloud) {
          //debugStr = cloud;
          respawnCloud(cloud);
        }

        function respawnCloud(cloud) {
          cloud.x = game.width;
          cloud.y = game.height * Math.random();
          var scale = Math.random()*cloudSize + 0.1;
          cloud.scale.setTo(scale);
          cloud.body.velocity.x = -cloudSpeed*Math.random() - cloudBaseSpeed;
        }

        function treePrint(obj) {
          if( isGroup(obj) ) {
            obj.forEach(treePrint);	 // recursively call
          }else{
            console.log(obj);  		 // otherwise, print it
          }
        }



        // MODIFIED: from 'loadSpriteTextureOnly' to 'refresh anything in general'
        function refreshFromFeatures(obj) {

          if( isSprite(obj) ) {
            obj.loadTexture(obj.key, 0, true);  // 0 ~ frame, true ~ pause.
          }
          else if( isText(obj) ) {
            if( obj.hasOwnProperty('feature_') ) {
              obj.text = obj.feature_.value;
            }
          }

        }

        function treeDo(obj, func) {
          if( isGroup(obj) ) {
            obj.forEach(function(objInner) { treeDo(objInner, func); });  // recursively call
          }else{
            func(obj);                                                    // do function
          }
        }

        function loadComplete() {
          // update all textures in the game world
          console.log("LOAD COMPLETE");
          game.world.forEach( function(obj) {
            treeDo(obj, refreshFromFeatures);
          });
        }

        // utility function for swapping texture randomly
        function updateTexturesRandom() {
          console.log("GRABBING RANDOM TEXTURE");

          // put random new textures onto load queue
          game.load.image(player.key, IMAGES[Math.floor(IMAGES.length*Math.random())] );
          //game.load.image('coin', 	IMAGES[Math.floor(IMAGES.length*Math.random())] );
          //game.load.image('cloud', 	IMAGES[Math.floor(IMAGES.length*Math.random())] );

          // start loading
          game.load.start();
        }

        // hacky utility functions for type checking
        function isGroup(obj)  { return obj.classType != undefined; }
        function isSprite(obj) { return obj.texture != undefined && obj.font == undefined; }
        function isText(obj)   { return obj.classType == undefined && obj.font != undefined; }

        function myTestLog() {
          console.log("WAZZUP!");
          console.log(game);      // local access to the game (the Phaser.game)
          console.log("WAZZUP!");
        }

        // zooms a clip to a target position with friction
        function zoom(o, x, y, xt ,yt, s, f, v_max) {
        	var vx, vy, dx, dy;

          // get previous velocity ('o' holds velocity from last frame)
        	if(o != null) {vx = o.vx; vy = o.vy; }else{ vx = vy = 0;}

          dx  = xt - x; dy  = yt - y;   // get offset and increase velocity
        	vx += dx*s  ; vy += dy*s  ;
        	vx *= f     ; vy *= f     ;

        	if(v_max != undefined) {     // maximum velocity
        	if(vx >  v_max) {vx = v_max; } if(vx < -v_max) {vx = -v_max;}
        	if(vy >  v_max) {vy = v_max; } if(vy < -v_max) {vy = -v_max;}
        	}

        	return {vx:vx, vy:vy};
        }

        // utility function
        function printFeatures() {
          var i, features;
          for(i = 0; i < __phaser.game.features.length; i++) {
            var f = __phaser.game.features[i];
            console.log( f.key + ' ' + f.value + ' ' + f.type + ' ' + f.message );
          }
        }

        /// externally callable functions here (using the 'this' keyword) ////
        ///////// call these functions with __phaser.game.callback() /////////

        // updates a specific feature
        this.updateFeature = function(data) {

          // Update feature list from changed feature
          // NOTE: mobile browser did not like pointer function for map(...)
          var index = __phaser.game.features.map( function(o) {return o.key;} ).indexOf(data.key);
          __phaser.game.features[index].value = data.value;

          // feature-specific game state changing functions
          if ( __phaser.game.features[index].key == 'title' ) {
            resetGame();
          }

          // change phaser bindings for sprites
          if( __phaser.game.features[index].type == 'image' ) {
            game.load.image(data.key, data.value);
          }

          game.load.start();
        }

        // TEST: call __phaser.game.callableFunction("");
        this.callableFunction = function(path) {
          myTestLog();
        }

      // end __phaser.game.init() --> not __phaser.init()
      },

    // end __phaser.game
    },
    //-------------------

    //-------------------
    destroyGame(callback){
          this.gameObj.destroy();
          callback();
    }
    // end __phaser.destroyGame()

    //-------------------


}
//--------------
OnLoadGlobal.callback({});  // on-load-global.js must be included in index.html
