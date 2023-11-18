$(document).ready(function() {
	var blocks = $('.block');
	var scores = [0, 0]; // Initial scores for both players
	var isJumping = [false, false]; // Assuming two players
	var isStunned = [false, false]; // Stunned state for players
	var fallSpeed = 3000; // Initial falling speed in milliseconds
	var coinInterval;
	var elapsedSeconds = 0;
	var gameContainer = $('#game-container');
	var timerInterval;
  var timeRemaining = 120;
	var bgAudio = new Audio('audio/bg.wav');
	var biteAudio = new Audio('audio/bite.wav');
	var jumpAudio = new Audio('audio/jump.mp3');
	var spitAudio = new Audio('audio/spit.mp3');
	var hurtAudio = new Audio('audio/hurt.mp3');
	var timesupAudio = new Audio('audio/timesup.wav');
	var countdownAudio = new Audio('audio/countdown.mp3');
	bgAudio.volume = 0.1;
	bgAudio.loop = true;
	biteAudio.volume = 0.3;
	jumpAudio.volume = 0.5;
	spitAudio.volume = 0.3;
	hurtAudio.volume = 0.3;
	timesupAudio.volume = 0.3;
	countdownAudio.volume = 0.3;
	bgAudio.play();

	function updateScores() {
		//$('#score-player1').text('Player 1: ' + scores[0]);
		//$('#score-player2').text('Player 2: ' + scores[1]);

		//var scoreStr = money.toString().padStart(6, '0');
  	//moneyDisplay.textContent = scoreStr;

		$('#score-player1').text('Player 1: ' + scores[0].toString().padStart(6, '0'));
		$('#score-player2').text('Player 2: ' + scores[1].toString().padStart(6, '0'));
	}

	// Array of background images
  var backgrounds = [
    'url(img/bg/bg1.png)',
    'url(img/bg/bg2.png)',
    'url(img/bg/bg3.png)',
    'url(img/bg/bg4.png)',
    'url(img/bg/bg5.png)',
  ];

  // Get a random index from the backgrounds array
  var randomIndex = Math.floor(Math.random() * backgrounds.length);

  // Set the random background image to the #game-container
  $('#game-container').css('background', backgrounds[randomIndex]);

	// Function to move the background sideways
  function moveBackground() {
    $('#game-container').animate({
      'background-position-x': '+=2px' // Adjust the speed by changing the value
    }, 100, 'linear', moveBackground);
  }

	// Call the function to start the animation
  moveBackground();

	function jump(playerIndex) {
		if (isStunned[playerIndex]) return; // Player cannot jump when stunned

		var block = blocks.eq(playerIndex);
		if (!isJumping[playerIndex]) {
			isJumping[playerIndex] = true;

			// Randomize spin direction
			var spinDirection = Math.random() < 0.5 ? 'right' : 'left';

			// Play jump sound
			jumpAudio.play();

			// Add the "jumping" class and set the spin direction
			//block.addClass('jumping').data('spinDirection', spinDirection);
			block.addClass('jumping ' + spinDirection);

			block.animate({
				bottom: '200px'
			}, 300, function() {
				block.animate({
					bottom: '16px'
				}, 300, function() {
					isJumping[playerIndex] = false;
					// Remove the "jumping" class to stop the spin animation
					//block.removeClass('jumping');
					block.removeClass('jumping right left');
				});
			});
		}
	}

	function moveLeft(playerIndex) {
		if (isStunned[playerIndex]) return; // Player cannot move when stunned

		var block = blocks.eq(playerIndex);
		var left = parseInt(block.css('left'));
		if (left - 30 > 0) {
			block.css('left', left - 15 + 'px');
			setBlockDirection(block, 'left');
		}
	}

	function moveRight(playerIndex) {
		if (isStunned[playerIndex]) return; // Player cannot move when stunned

		var block = blocks.eq(playerIndex);
		var left = parseInt(block.css('left'));
		var windowWidth = $('#game-container').width();
		var blockWidth = block.width();
		if (left + blockWidth + -35 < windowWidth) {
			block.css('left', left + 15 + 'px');
			setBlockDirection(block, 'right');
		}
	}

	function setBlockDirection(block, direction) {
		block.removeClass('right left');
		if (direction) {
			var blockIdNumber = block.attr('id').match(/\d+/)[0];
			block.addClass(direction);
			block.css({
				//'background-image': `url("img/character${direction.charAt(0).toUpperCase() + direction.slice(1)}.png")`
				'background-image': `url("img/character${blockIdNumber}${direction.charAt(0).toUpperCase() + direction.slice(1)}.png")`
			});
		}
	}
	/*
	function checkCollision() {
		blocks.each(function(index) {
			var block = $(this);
			var blockTop = block.position().top;
			var blockLeft = block.position().left;
			var blockWidth = block.width();
			var blockHeight = block.height();

			$('.coin').each(function() {
				var coin = $(this);
				var coinTop = coin.position().top;
				var coinLeft = coin.position().left;
				var coinWidth = coin.width();
				var coinHeight = coin.height();

				if (
					blockTop + blockHeight >= coinTop &&
					blockTop <= coinTop + coinHeight &&
					blockLeft + blockWidth >= coinLeft &&
					blockLeft <= coinLeft + coinWidth
				) {
					if (blockTop + blockHeight - 10 >= coinTop) {
						scores[index] += 10;
						updateScores();
						coin.remove();
					}
				} else if (coinTop + coinHeight >= gameContainer.offset().top + gameContainer.height()) {
					coin.remove();
				}
			});
		});
	}
	*/

	function checkCollision() {
    blocks.each(function(index) {
      var block = $(this);
      var blockTop = block.position().top;
      var blockLeft = block.position().left;
      var blockWidth = block.width();
      var blockHeight = block.height();

      $('.coin').each(function() {
        var coin = $(this);
        var coinTop = coin.position().top;
        var coinLeft = coin.position().left;
        var coinWidth = coin.width();
        var coinHeight = coin.height();

        if (
          blockTop + blockHeight >= coinTop &&
          blockTop <= coinTop + coinHeight &&
          blockLeft + blockWidth >= coinLeft &&
          blockLeft <= coinLeft + coinWidth
        ) {
          if (blockTop + blockHeight - 10 >= coinTop) {
            scores[index] += 100;
            updateScores();
            coin.remove();

						// Play bite sound
						biteAudio.play();
          }
        } else if (coinTop + coinHeight >= gameContainer.offset().top + gameContainer.height()) {
          coin.remove();
        }
      });

			// Iterate over bullets to check collision with the specific player
		  $('.bullet').each(function() {
		    var bullet = $(this);
		    var bulletTop = bullet.position().top;
		    var bulletLeft = bullet.position().left;
		    var bulletWidth = bullet.width();
		    var bulletHeight = bullet.height();

		    if (
		      blockTop + blockHeight >= bulletTop &&
		      blockTop <= bulletTop + bulletHeight &&
		      blockLeft + blockWidth >= bulletLeft &&
		      blockLeft <= bulletLeft + bulletWidth
		    ) {
		      if (blockTop + blockHeight - 10 >= bulletTop) {
		        // Player is hit, apply stun
		        isStunned[index] = true;
		        block.addClass('stunned');

						// Play hurt sound
						hurtAudio.play();

		        // Shake effect
		        setTimeout(function() {
		          block.removeClass('stunned');
		          isStunned[index] = false;
		        }, 1500); // Stun duration (3 seconds)

		        // Remove the bullet after hitting a player
		        bullet.remove();
		      }
		    }
		  });
    });
  }

	function createCoin() {
		var coinImages = [
			'img/food3/01.png',
			'img/food3/02.png',
			'img/food3/03.png',
			'img/food3/04.png',
			'img/food3/05.png',
			'img/food3/06.png',
			'img/food3/07.png',
			'img/food3/08.png',
			'img/food3/09.png',
			'img/food3/10.png',
			'img/food3/11.png',
			'img/food3/12.png',
			'img/food3/13.png',
			'img/food3/14.png',
			'img/food3/15.png',
			'img/food3/16.png',
			'img/food3/17.png',
			'img/food3/18.png',
			'img/food3/19.png',
			'img/food3/20.png',
			'img/food3/21.png',
			'img/food3/22.png',
			'img/food3/23.png',
			'img/food3/24.png',
			'img/food3/25.png',
		];

		var coin = $('<div class="coin coin-image"></div>');
		var coinLeft = Math.random() * (gameContainer.width() - 20);
		coin.css({
			left: coinLeft,
			top: 0,
			background: 'url(' + coinImages[Math.floor(Math.random() * coinImages.length)] + ')',
			backgroundSize: 'cover',
		});
		gameContainer.append(coin);

		coin.animate({ top: '100%' }, fallSpeed, 'linear', function() {
			$(this).remove();
		});
	}

	// Initial positions for Player 1 and Player 2
	//blocks.eq(0).css('left', '35px'); // Bottom-left corner
	//blocks.eq(1).css('left', 'calc(100% - 85px)'); // Bottom-right corner

	coinInterval = setInterval(function() {
		createCoin();
		elapsedSeconds += 3;
		if (elapsedSeconds >= 60) {
			fallSpeed = 1500;
		}
	}, 3000);


	function shoot(playerIndex) {
	  if (isStunned[playerIndex] || isJumping[playerIndex]) return; // Player cannot shoot when stunned or jumping

	  var block = blocks.eq(playerIndex);

	  // Check if the player has enough points to shoot
	  if (scores[playerIndex] >= 5) {
	    var bullet = $('<div class="bullet"></div>');
	    //bullet.css('left', block.position().left + (playerIndex === 0 ? block.width() + 20 : 0) - 2.5 + 'px');
			bullet.css('left', block.position().left + (playerIndex === 0 ? block.width() + 20 : playerIndex === 1 ? block.width() + -90 : 0) - 2.5 + 'px');
	    bullet.css('bottom', '50px'); // Adjust the starting position of the bullet
	    $('#game-container').append(bullet);

	    // Play spit sound
	    spitAudio.play();

	    // Player lose points when shooting
	    scores[playerIndex] -= 5;
	    updateScores();

	    // Move the bullet horizontally
	    bullet.animate({ left: (playerIndex === 0 ? '100%' : '0%') }, 1000, 'linear', function() {
	      $(this).remove();
	    });
	  }
	}

	// Gamepad API
	function handleGamepadInput() {
		var gamepads = navigator.getGamepads();
		if (!gamepads) return;

		// Assuming two gamepads are connected
		var gamepad = gamepads[0];
		var gamepad2 = gamepads[1];

		handleControllerInput(gamepad, 0);
		handleControllerInput(gamepad2, 1);
	}

	function handleControllerInput(controller, playerIndex) {
		if (!controller) return;

		// Example: A button for jump, left thumbstick for movement
		if (controller.buttons[0].pressed) {
			jump(playerIndex);
		} else if (controller.buttons[2].pressed) {
	    // Handle X button press for a specific action
	    shoot(playerIndex);
	  }

		var stickThreshold = 0.5;
		if (controller.axes[0] < -stickThreshold) {
			moveLeft(playerIndex);
		} else if (controller.axes[0] > stickThreshold) {
			moveRight(playerIndex);
		}
	}

	setInterval(handleGamepadInput, 50);

	// Keyboard input
	$(document).keydown(function(e) {
		switch (e.which) {
			case 87: // W key for jump
				jump(0); // Assuming space bar controls player 1
				break;
			case 65: // A key for move left
				moveLeft(0); // Assuming A key controls player 1
				break;
			case 68: // D key for move right
				moveRight(0); // Assuming D key controls player 1
				break;
			case 32: // Space bar key for spitting
				shoot(0); // Assuming Space bar key controls player 1
				break;
			case 38: // Up arrow key for jump
				jump(1); // Assuming up arrow key controls player 2
				break;
			case 37: // Left arrow key for move left
				moveLeft(1); // Assuming left arrow key controls player 2
				break;
			case 39: // Right arrow key for move left
				moveRight(1); // Assuming right arrow key controls player 2
				break;
			case 16: // Right shift key for move shooting
				shoot(1); // Assuming Right shift key controls player 2
				break;
		}
	});

	// Function to reset the timer
	function resetTimer() {
		clearInterval(timerInterval);
		timeRemaining = 150;
	 	updateTimerDisplay();
	 	startTimer();
	}

	// Function to start the timer
  function startTimer() {
    updateTimerDisplay();

    // Start the countdown interval
    timerInterval = setInterval(function() {
      timeRemaining--; // Decrease the time remaining
      updateTimerDisplay(); // Update the timer display

			if (timeRemaining === 4) {
          countdownAudio.play();
      }

      if (timeRemaining <= 0) {
        // Time's up, restart the level

				// But first, compare scores
				if (scores[0] > scores[1]) {
					swal("Time's up!", "Player 1 wins!").then((value) => {
					  location.reload(); // Reload page
					});
				} else if (scores[1] > scores[0]) {
					swal("Time's up!", "Player 2 wins!").then((value) => {
					  location.reload(); // Reload page
					});
				} else {
					swal("Time's up!", "It's a tie!").then((value) => {
					  location.reload(); // Reload page
					});
				}

        clearInterval(timerInterval); // Clear timer interval
				clearInterval(coinInterval); // Clear coin interval
				bgAudio.pause(); // Pause background music
				$('#game-container').stop(); // Stop background animation
				timesupAudio.play(); // Play times up sound
      }
    }, 1000); // Run the interval every 1 second (1000 milliseconds)
  }

  // Function to update the timer display
  function updateTimerDisplay() {
    //var timerElement = $('#timer span');
    //timerElement.text(timeRemaining);

		var timerElement = $('#timer span');
	  var minutes = Math.floor((timeRemaining % 3600) / 60);
	  var seconds = timeRemaining % 60;

	  // Format the time components to have leading zeros if needed
	  var formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

	  timerElement.text(formattedTime);
  }

	// Game loop
	setInterval(function() {
		checkCollision();
	}, 100);

	// Reset timer on page load
	resetTimer();
});
