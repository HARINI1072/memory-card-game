
// Select HTML elements
const gameBoard = document.querySelector(".game-board");
const movesDisplay = document.querySelector(
    ".info-box:nth-child(1) h2"
);
const timerDisplay = document.querySelector(
    ".info-box:nth-child(2) h2"
);
const matchesDisplay = document.querySelector(
    ".info-box:nth-child(3) h2"
);

const restartBtn = document.querySelector(".restart-btn");
const hintBtn = document.querySelector("#hint-btn");
const gameMessage = document.querySelector(".game-message");
// Difficulty, Level and Mode screens
const difficultyScreen = document.querySelector("#difficulty-screen");
const levelScreen = document.querySelector("#level-screen");
const progressScreen = document.querySelector("#progress-screen");

const progressBtn = document.querySelector("#progress-btn");

const backProgressBtn = document.querySelector("#back-progress-btn");
const modeScreen = document.querySelector("#mode-screen");
const gamePlayScreen = document.querySelector("#game-play-screen");
// Current level information
const currentLevelTitle = document.querySelector("#current-level-title");
const currentGameDetails = document.querySelector("#current-game-details");
// Level 5 Sequence Elements
const sequenceDisplay = document.querySelector("#sequence-display");
const sequenceEmojis = document.querySelector("#sequence-emojis");
const sequenceMessage = document.querySelector("#sequence-message");

const difficultyButtons = document.querySelectorAll(".difficulty-btn");
const levelsGrid = document.querySelector("#levels-grid");
const levelHeading = document.querySelector("#level-heading");

const backDifficultyBtn = document.querySelector("#back-difficulty-btn");
const backLevelBtn = document.querySelector("#back-level-btn");
const backToLevelsBtn = document.querySelector("#back-to-levels-btn");
const backToHomeBtn = document.querySelector("#back-to-home-btn");

const normalModeBtn = document.querySelector("#normal-mode-btn");
const challengeModeBtn = document.querySelector("#challenge-mode-btn");

// Selected game settings
let selectedDifficulty = "";
let selectedLevel = 1;
let selectedPairs = 4;
let selectedMode = "normal";
let timeLimit = 0;
let remainingTime = 0;
let previewTimer;
let mysteryCards = [];
let requiredSequence = [];
let sequenceIndex = 0;
const bestScoreDisplay = document.querySelector("#best-score");

// Winning popup elements
const winPopup = document.querySelector("#win-popup");
const finalMoves = document.querySelector("#final-moves");
const finalTime = document.querySelector("#final-time");
const playAgainBtn = document.querySelector("#play-again-btn");
const nextLevelBtn = document.querySelector("#next-level-btn");
const winTitle = document.querySelector("#win-title");
const timeUpPopup = document.querySelector("#time-up-popup");
const retryBtn = document.querySelector("#retry-btn");

// Sound effects
const flipSound = new Audio("sounds/flip.mp3");
const matchSound = new Audio("sounds/match.mp3");
const wrongSound = new Audio("sounds/wrong.mp3");
const winSound = new Audio("sounds/win.mp3");
let soundEnabled = true;

const soundBtn = document.querySelector("#sound-btn");
const startScreen = document.querySelector("#start-screen");
const startBtn = document.querySelector("#start-btn");
const gameContainer = document.querySelector(".game-container");
const homeBtn = document.querySelector("#home-btn");

// Common function for all sounds
function playSound(sound) {

    if (!soundEnabled) return;

    sound.currentTime = 0;
    sound.play();
}

// Game variables
let flippedCards = [];
let moves = 0;
let matches = 0;
let currentDailyStreak = 0;
let firstAttemptPairs = new Set();
let hintsRemaining = 3;
let gameCounted = false;
let seconds = 0;
let timer = null;
let lockBoard = false;
let gameStarted = false;
let isPaused = false;
let totalPairs = 8;

// Display the saved best score

function displayBestScore() {

    const scoreKey = "memoryBest-" + selectedDifficulty +
                     "-level-" + selectedLevel;

    const savedScore = localStorage.getItem(scoreKey);

    bestScoreDisplay.textContent =
        savedScore !== null ? savedScore : "--";

}


// Available emojis
const emojis = [
    "🍎", "🍌", "🍇", "🍊",
    "🍓", "🍍", "🥝", "🍒"
];



// Create game cards
function createCards() {

    // Clear any previous preview timer
    clearTimeout(previewTimer);

    gameBoard.innerHTML = "";

    totalPairs = selectedPairs;

    matchesDisplay.textContent = "0 / " + totalPairs;

    // Select emojis according to difficulty
    const selectedEmojis = emojis.slice(0, totalPairs);

    // Create matching pairs
    let cardEmojis = [...selectedEmojis, ...selectedEmojis];

    // Shuffle cards
    cardEmojis.sort(() => Math.random() - 0.5);

    // Set grid columns
    gameBoard.style.gridTemplateColumns = "repeat(4, 1fr)";

    // Create HTML cards
    cardEmojis.forEach(function(emoji) {

        const card = document.createElement("div");

        card.classList.add("card");

        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">?</div>
                <div class="card-back">${emoji}</div>
            </div>
        `;

        card.addEventListener("click", function() {

    if (isPaused) return;

    flipCard(card);

});

        gameBoard.appendChild(card);

    });

    // Level 2: Preview all cards for 1 seconds
    if (selectedLevel === 2) {

        const cards = gameBoard.querySelectorAll(".card");

        lockBoard = true;

        // Show all cards
        cards.forEach(function(card) {
            card.classList.add("flipped");
        });

        // Hide cards after 1 seconds
        previewTimer = setTimeout(function() {

            cards.forEach(function(card) {
                card.classList.remove("flipped");
            });

            lockBoard = false;

        }, selectedDifficulty === "hard" ? 2000 : 1000);

    }
    // Level 4: Mystery Preview
if (selectedLevel === 4) {

    const cards = gameBoard.querySelectorAll(".card");

    // Select two random cards
    mysteryCards = [];

    while (mysteryCards.length < 2) {
        const randomIndex = Math.floor(Math.random() * cards.length);

        if (!mysteryCards.includes(cards[randomIndex])) {
            mysteryCards.push(cards[randomIndex]);
        }
    }

    lockBoard = true;

    // Show all cards
    cards.forEach(function(card) {
        card.classList.add("flipped");
    });

    // Hide two selected cards' emojis
    mysteryCards.forEach(function(card) {
        card.classList.add("mystery-card");
    });

    // Hide all cards after preview
    previewTimer = setTimeout(function() {

        cards.forEach(function(card) {
            card.classList.remove("flipped");
            card.classList.remove("mystery-card");
        });

        mysteryCards = [];
        lockBoard = false;

    }, 2000);
}

}

// Timer
function startTimer() {

    if (gameStarted) return;

    gameStarted = true;

    timer = setInterval(function() {
                if (isPaused) return;

        if (selectedMode === "challenge" && timeLimit > 0) {

            remainingTime--;

            let minutes = Math.floor(remainingTime / 60);
            let secondsLeft = remainingTime % 60;

            timerDisplay.textContent =
                String(minutes).padStart(2, "0") + ":" +
                String(secondsLeft).padStart(2, "0");

            if (remainingTime <= 0) {
                clearInterval(timer);
                gameStarted = false;
                lockBoard = true;
                timeUpPopup.style.display = "flex";
                return;
            }

        } else {

            seconds++;

            let minutes = Math.floor(seconds / 60);
            let remainingSeconds = seconds % 60;

            timerDisplay.textContent =
                String(minutes).padStart(2, "0") + ":" +
                String(remainingSeconds).padStart(2, "0");

        }

    }, 1000);
}
// Pause and Play Button
document.getElementById("pause-btn").addEventListener("click", function() {

    isPaused = !isPaused;

    this.textContent = isPaused ? "▶" : "⏸";

    document.getElementById("paused-message").style.display =
        isPaused ? "block" : "none";

});


// Flip card
function flipCard(card) {

    if (lockBoard) return;

    if (card.classList.contains("flipped")) return;

    if (card.classList.contains("matched")) return;

    if (matches === totalPairs) return;

    startTimer();
    if (!gameCounted) {
    let totalGames = Number(localStorage.getItem("totalGames")) || 0;

    totalGames++;

    localStorage.setItem("totalGames", totalGames);

    gameCounted = true;
}

    card.classList.add("flipped");

    // Play flip sound
    playSound(flipSound);

    flippedCards.push(card);

    if (flippedCards.length === 2) {

        moves++;

        movesDisplay.textContent = moves;

        checkMatch();

    }

}

//check match
function checkMatch() {

    const firstCard = flippedCards[0];
    const secondCard = flippedCards[1];

    const firstEmoji =
        firstCard.querySelector(".card-back").textContent;

    const secondEmoji =
        secondCard.querySelector(".card-back").textContent;

    if (firstEmoji === secondEmoji) {

    // Level 5: Check reverse matching order
    if (
        selectedLevel === 5 &&
        firstEmoji !== requiredSequence[sequenceIndex]
    ) {
        playSound(wrongSound);
        lockBoard = true;

        setTimeout(function() {
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");

            flippedCards = [];
            lockBoard = false;
        }, 1000);

        return;
    }

    playSound(matchSound);

        firstCard.classList.add("matched");
        secondCard.classList.add("matched");

        matches++;
        // Count only first-attempt correct pairs
if (!firstAttemptPairs.has(firstEmoji)) {

    let totalMatched = Number(
        localStorage.getItem("totalPairsMatched") || 0
    );

    totalMatched++;

    localStorage.setItem(
        "totalPairsMatched",
        totalMatched
    );
}

        matchesDisplay.textContent =
            matches + " / " + totalPairs;
            // Level 5: Move to the previous emoji in the sequence
if (selectedLevel === 5) {
    sequenceIndex--;
}

        flippedCards = [];

        if (matches === totalPairs) {
            // Update Daily Streak after winning
            updateDailyStreak();
            // Save completed level
const completedKey = "completed-" + selectedDifficulty;

let completedLevels = JSON.parse(
    localStorage.getItem(completedKey) || "[]"
);

if (!completedLevels.includes(selectedLevel)) {
    completedLevels.push(selectedLevel);

    localStorage.setItem(
        completedKey,
        JSON.stringify(completedLevels)
    );
}
            
            playSound(winSound);
            clearInterval(timer);
            // Save total games won
let totalWins = Number(
    localStorage.getItem("totalWins") || 0
);

totalWins++;

localStorage.setItem("totalWins", totalWins);

            
const scoreKey = "memoryBest-" + selectedDifficulty +
                 "-level-" + selectedLevel;

const previousBest = localStorage.getItem(scoreKey);

if (
    previousBest === null ||
    moves < Number(previousBest)
) {
    localStorage.setItem(scoreKey, moves);

    displayBestScore();

    winTitle.textContent = "🏆 New Best Score! 🏆";
    gameMessage.textContent =
        "Congratulations! New Best Score! 🏆";

} else {
    winTitle.textContent = "🎉 Congratulations! 🎉";
    gameMessage.textContent =
        "Congratulations! You won! 🎉";
}

// Unlock the next level
const unlockKey = "unlocked-" + selectedDifficulty;
const currentUnlocked = Number(
    localStorage.getItem(unlockKey) || 1
);

if (
    selectedLevel === currentUnlocked &&
    selectedLevel < 5
) {
    localStorage.setItem(unlockKey, selectedLevel + 1);
}


            finalMoves.textContent = "Moves: " + moves;

            finalTime.textContent =
                "Time: " + timerDisplay.textContent;

            // Show Next Level button only before Level 5
if (selectedLevel < 5) {
    nextLevelBtn.style.display = "inline-block";
} else {
    nextLevelBtn.style.display = "none";
}

winPopup.style.display = "flex";
        }

    } else {
        // Mark both emoji pairs as already attempted
firstAttemptPairs.add(firstEmoji);
firstAttemptPairs.add(secondEmoji);

        playSound(wrongSound);

        lockBoard = true;

        setTimeout(function() {

            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");

            flippedCards = [];

            lockBoard = false;

        }, selectedLevel === 3 ? 500 : 1000);

    }

}

// Restart game
function restartGame() {
    isPaused = false;
document.getElementById("pause-btn").textContent = "⏸";
document.getElementById("paused-message").style.display = "none";


    clearInterval(timer);

    moves = 0;
    matches = 0;
    firstAttemptPairs.clear();
    hintsRemaining = 3;
    hintBtn.textContent = "💡 Hint (3)";
    hintBtn.disabled = false;
    gameCounted = false;
    seconds = 0;

    remainingTime = timeLimit;

    flippedCards = [];

    lockBoard = false;
    gameStarted = false;

    movesDisplay.textContent = "00";

    if (selectedMode === "challenge" && timeLimit > 0) {
        let minutes = Math.floor(remainingTime / 60);
        let secondsLeft = remainingTime % 60;

        timerDisplay.textContent =
            String(minutes).padStart(2, "0") + ":" +
            String(secondsLeft).padStart(2, "0");

    } else {

        timerDisplay.textContent = "00:00";

    }

    gameMessage.textContent = "";
    
    winPopup.style.display = "none";
    timeUpPopup.style.display = "none";

    createCards();

// Show sequence again for Level 5
if (selectedLevel === 5) {
    startReverseChallenge();
} else {
    sequenceDisplay.style.display = "none";
}
}

// Restart button
restartBtn.addEventListener("click", restartGame);

// Retry after time runs out
retryBtn.addEventListener("click", function() {

    timeUpPopup.style.display = "none";

    restartGame();

});
// Hint Button
hintBtn.addEventListener("click", function() {

    if (hintsRemaining <= 0 || lockBoard) {
    return;
}

    const availableCards = Array.from(
        gameBoard.querySelectorAll(".card")
    ).filter(function(card) {
        return !card.classList.contains("flipped") &&
               !card.classList.contains("matched");
    });

    if (availableCards.length === 0) {
        return;
    } 

    const randomCard = availableCards[
        Math.floor(Math.random() * availableCards.length)
    ];

    hintsRemaining--;
    hintBtn.textContent = "💡 Hint (" + hintsRemaining + ")";

    randomCard.classList.add("flipped");
    randomCard.classList.add("hint-glow");
    playSound(flipSound);

    lockBoard = true;

    setTimeout(function() {
        randomCard.classList.remove("flipped");
        randomCard.classList.remove("hint-glow");
        lockBoard = false;
    }, 1000);

});

// Open My Progress Screen
progressBtn.addEventListener("click", function() {

    difficultyScreen.style.display = "none";
    progressScreen.style.display = "block";

    // Games Played
    document.querySelector("#total-games").textContent =
    (localStorage.getItem("totalGames") || 0) + " 🎮";
    // Games Won
document.querySelector("#total-wins").textContent =
    (localStorage.getItem("totalWins") || 0) + " 🏆";

    // Perfect Pairs Matched
   document.querySelector("#total-matches").textContent =
    (localStorage.getItem("totalPairsMatched") || 0) + " 💎";
    // Check and update Daily Streak
updateDailyStreak();

// Display Daily Streak
document.querySelector("#daily-streak").textContent =
    (localStorage.getItem("dailyStreak") || 0) + " 🔥";

    // Easy Progress
    const easyCompleted = JSON.parse(
        localStorage.getItem("completed-easy") || "[]"
    );

    document.querySelector("#easy-progress").textContent =
        "Easy: " + easyCompleted.length + " / 5";

    // Medium Progress
    const mediumCompleted = JSON.parse(
        localStorage.getItem("completed-medium") || "[]"
    );

    document.querySelector("#medium-progress").textContent =
        "Medium: " + mediumCompleted.length + " / 5";

    // Hard Progress
    const hardCompleted = JSON.parse(
        localStorage.getItem("completed-hard") || "[]"
    );

    document.querySelector("#hard-progress").textContent =
        "Hard: " + hardCompleted.length + " / 5";
   
    // Calculate Total Completed Levels
let totalCompletedLevels = 0;

["easy", "medium", "hard"].forEach(difficulty => {

    const completedLevels = JSON.parse(
        localStorage.getItem("completed-" + difficulty) || "[]"
    );

    totalCompletedLevels += completedLevels.length;
});

// Display Total Completed Levels
document.querySelector("#total-levels-completed").textContent =
    "Total Levels Completed: " + totalCompletedLevels + " / 15";

});

// Back from Progress Screen
backProgressBtn.addEventListener("click", function() {

    progressScreen.style.display = "none";
    difficultyScreen.style.display = "block";

});

// Difficulty change

// Number of pairs for each difficulty
const levelPairs = {
    easy: [4, 4, 4, 4, 4],
    medium: [6, 6, 6, 6, 6],
    hard: [8, 8, 8, 8, 8]
};

// Difficulty selection
difficultyButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        selectedDifficulty = button.dataset.difficulty;

        difficultyScreen.style.display = "none";
        levelScreen.style.display = "block";

        levelHeading.textContent =
            selectedDifficulty.toUpperCase() + " LEVELS";

        showLevels();

    });

});

// Display levels
function showLevels() {

    levelsGrid.innerHTML = "";

    const unlockedLevel = Number(
        localStorage.getItem("unlocked-" + selectedDifficulty) || 1
    );

    levelPairs[selectedDifficulty].forEach(function(pairs, index) {

        const levelNumber = index + 1;

        const levelBtn = document.createElement("button");

        levelBtn.classList.add("level-btn");

        if (levelNumber <= unlockedLevel) {

            levelBtn.textContent = "Level " + levelNumber + " 🔓";

            levelBtn.addEventListener("click", function() {

                selectedLevel = levelNumber;
                selectedPairs = pairs;

                levelScreen.style.display = "none";
                modeScreen.style.display = "block";
                // Update mode descriptions
if (selectedLevel === 1) {

    normalModeBtn.querySelector("span").textContent =
        "No Time Limit";

    challengeModeBtn.querySelector("span").textContent =
        "No Time Limit";

} else {

    normalModeBtn.querySelector("span").textContent =
        "No Time Limit";

    challengeModeBtn.querySelector("span").textContent =
        "Play Against Time";

}
            });

        } else {

            levelBtn.textContent = "Level " + levelNumber + " 🔒";
            levelBtn.classList.add("locked");
            levelBtn.disabled = true;

        }

        levelsGrid.appendChild(levelBtn);

    });

}

// Back to difficulty
backDifficultyBtn.addEventListener("click", function() {

    levelScreen.style.display = "none";
    difficultyScreen.style.display = "block";

});

// Challenge Mode time limits (in seconds)
const challengeTimes = {
    easy: [0, 120, 100, 80, 60],
    medium: [0, 90, 75, 60, 45],
    hard: [0, 75, 60, 50, 40]
};

// Start Normal Mode
normalModeBtn.addEventListener("click", function() {

    selectedMode = "normal";
    timeLimit = 0;

    startSelectedGame();

});

// Start Challenge Mode
challengeModeBtn.addEventListener("click", function() {

    selectedMode = "challenge";

    timeLimit =
        challengeTimes[selectedDifficulty][selectedLevel - 1];

    startSelectedGame();

});

// Start the selected game
function startSelectedGame() {

    modeScreen.style.display = "none";

// Hide Memory Match heading during gameplay
document.querySelector(".game-header").style.display = "none";

gamePlayScreen.style.display = "block";

// Update current level information
currentLevelTitle.textContent =
    selectedDifficulty.toUpperCase() + " - LEVEL " + selectedLevel;

currentGameDetails.textContent =
    selectedMode === "normal" ? "Normal Mode" : "Challenge Mode";

   restartGame();
displayBestScore();
}


// Back to level selection
backLevelBtn.addEventListener("click", function() {

    modeScreen.style.display = "none";
    levelScreen.style.display = "block";

});

// Hide the game until Play Game is clicked
gameContainer.style.display = "none";
soundBtn.addEventListener("click", function() {

    soundEnabled = !soundEnabled;

    if (soundEnabled) {
        soundBtn.textContent = "🔊 Sound ON";
    } else {
        soundBtn.textContent = "🔇 Sound OFF";
    }

});
// Play Again button
playAgainBtn.addEventListener("click", function() {

    winPopup.style.display = "none";

    restartGame();
 
});
// Next Level button
nextLevelBtn.addEventListener("click", function() {

    if (selectedLevel < 5) {

        selectedLevel++;

        // Update mode descriptions
        normalModeBtn.querySelector("span").textContent =
            "No Time Limit";

        challengeModeBtn.querySelector("span").textContent =
            "Play Against Time";
            
        winPopup.style.display = "none";
        gamePlayScreen.style.display = "none";
        modeScreen.style.display = "block";

    }

});

// Start Game button
startBtn.addEventListener("click", function() {

    startScreen.style.display = "none";
    gameContainer.style.display = "block";

    difficultyScreen.style.display = "block";
    levelScreen.style.display = "none";
    modeScreen.style.display = "none";
    gamePlayScreen.style.display = "none";

});
// Back to Home from Difficulty Selection
backToHomeBtn.addEventListener("click", function() {

    gameContainer.style.display = "none";
    startScreen.style.display = "flex";

    difficultyScreen.style.display = "block";
    levelScreen.style.display = "none";
    modeScreen.style.display = "none";
    gamePlayScreen.style.display = "none";

});
// Back to Level Selection
backToLevelsBtn.addEventListener("click", function() {

    restartGame();

    gamePlayScreen.style.display = "none";
    modeScreen.style.display = "none";
    levelScreen.style.display = "block";

    showLevels();

});

//Home Button

homeBtn.addEventListener("click", function() {

    const confirmHome = confirm(
        "Do you want to go back to the home screen?"
    );

    if (confirmHome) {

        restartGame();

        gameContainer.style.display = "none";
        startScreen.style.display = "flex";

        difficultyScreen.style.display = "block";
        levelScreen.style.display = "none";
        modeScreen.style.display = "none";
        gamePlayScreen.style.display = "none";

    }

});

// Level 5: Generate Reverse Memory Sequence
function startReverseChallenge() {

    // Select emojis according to difficulty
    requiredSequence = [...emojis]
        .slice(0, selectedPairs)
        .sort(() => Math.random() - 0.5);

    // Start from the last emoji
    sequenceIndex = requiredSequence.length - 1;

    // Display the sequence
    sequenceEmojis.textContent =
        requiredSequence.join(" ");

    sequenceMessage.textContent =
        "Memorize the order carefully!";

    sequenceDisplay.style.display = "block";

    // Lock cards during the preview
    lockBoard = true;

    // Hide sequence after 5 seconds
    previewTimer = setTimeout(function() {

        sequenceDisplay.style.display = "none";

        lockBoard = false;

    }, 2000);
} 
// Update Daily Streak
function updateDailyStreak() {

    const today = new Date().toLocaleDateString("en-CA");

    const lastPlayed = localStorage.getItem("lastPlayedDate");

    currentDailyStreak = Number(
        localStorage.getItem("dailyStreak") || 0
    );
    // Check if a day was missed
if (lastPlayed) {
    const previousDate = new Date(lastPlayed);
    const currentDate = new Date(today);

    const difference = Math.round(
        (currentDate - previousDate) / (1000 * 60 * 60 * 24)
    );

    if (difference > 1) {
        currentDailyStreak = 0;
        localStorage.setItem("dailyStreak", 0);
    }
}

    if (lastPlayed === today) {
        return;
    }

    if (lastPlayed) {

        const previousDate = new Date(lastPlayed);
        const currentDate = new Date(today);

        const difference = Math.round(
            (currentDate - previousDate) / (1000 * 60 * 60 * 24)
        );

        if (difference === 1) {
            currentDailyStreak++;
        } else {
            currentDailyStreak = 1;
        }

    } else {
        currentDailyStreak = 1;
    }

    localStorage.setItem("dailyStreak", currentDailyStreak);
    localStorage.setItem("lastPlayedDate", today);
}