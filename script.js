// --- Data Set (Curated from NoxInfluencer Top PH TikTok Creators) ---
const TIKTOK_DATA = [
    { name: "Niana Guerrero", followers: 46.1 },
    { name: "Marie Twins🐵👭🏼", followers: 23.1 },
    { name: "Yanyan De Jesus", followers: 23.1 },
    { name: "ROSMAR", followers: 22.4 },
    { name: "Ivana Alawi", followers: 22.2 },
    { name: "Andrea Brillantes", followers: 21.4 },
    { name: "Grae Cabase ᵗᵈ", followers: 20.2 },
    { name: "MONA", followers: 18.9 },
    { name: "Vladimir Grand", followers: 18.3 },
    { name: "Hazel Grace", followers: 17.8 },
    { name: "Zeinab Harake Parks", followers: 17.5 },
    { name: "mona alawi", followers: 16.4 },
    { name: "Sanya Lopez", followers: 16.3 },
    { name: "Xspencer", followers: 16.1 },
    { name: "Mobile Legends Philippines", followers: 16.0 },
    { name: "Dasuri Choi", followers: 15.7 },
    { name: "Prince Adrian Dagdag", followers: 15.7 },
    { name: "Toni Fowler", followers: 15.6 },
    { name: "Roce Ordoñez", followers: 15.3 },
    { name: "Queenay👸🏻", followers: 15.3 },
    { name: "siliqueen🌶️👸🏻", followers: 15.2 },
    { name: "Angela Mae Evangelista", followers: 15.0 },
    { name: "Christian Mae 💋", followers: 14.9 },
    { name: "Whamoscruz", followers: 14.9 },
    { name: "🍒Cherry Keem🍒", followers: 14.4 },
    { name: "The Gold Squad", followers: 14.0 }, 
    { name: "Boss Keng", followers: 13.9 },
    { name: "Janio", followers: 13.4 },
    { name: "Jugs and Kim", followers: 13.2 },
    { name: "DJ Loonyo", followers: 13.0 },
];

// --- Game Variables ---
let currentRound = 1;
const MAX_ROUNDS = 10;
let currentStreak = 0;
let cardA = null;
let cardB = null;
let playerAlias = ''; 

// --- DOM Elements ---
const mainGameEl = document.getElementById('main-game');
const startModalEl = document.getElementById('start-modal');
const startAliasFormEl = document.getElementById('start-alias-form');
const leaderboardListStartEl = document.getElementById('leaderboard-list-start');

const roundInfoEl = document.getElementById('round-info');
const nameAEl = document.getElementById('name-a');
const valueAEl = document.getElementById('value-a');
const nameBEl = document.getElementById('name-b');
const valueBContainerEl = document.getElementById('value-b-container');
const valueBEl = document.getElementById('value-b');
const messageEl = document.getElementById('message');
const modalEl = document.getElementById('leaderboard-modal');
const finalScoreEl = document.getElementById('final-score');

// --- Leaderboard & Persistence Functions ---

function getLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('higherLowerLeaderboard')) || [];
    // Sort descending by score and get top 10
    return scores.sort((a, b) => b.score - a.score).slice(0, 10);
}

function saveScore(alias, score) {
    const scores = JSON.parse(localStorage.getItem('higherLowerLeaderboard')) || [];
    // Push score only if a valid alias was entered
    if (alias) { 
        scores.push({ alias, score, date: new Date().toLocaleDateString() });
        localStorage.setItem('higherLowerLeaderboard', JSON.stringify(scores));
    }
}

function renderLeaderboard(listElement) {
    const topScores = getLeaderboard();
    listElement.innerHTML = topScores.map((entry, index) => 
        `<li>${index + 1}. **${entry.alias}** - ${entry.score} rounds (${entry.date})</li>`
    ).join('');
}

// --- Game Initialization ---

function initGame() {
    // 1. Render the leaderboard on the start screen
    renderLeaderboard(leaderboardListStartEl);
    
    // 2. Set up listener for alias submission to hide modal and start game
    startAliasFormEl.addEventListener('submit', function(e) {
        e.preventDefault();
        const aliasInput = document.getElementById('start-alias-input');
        playerAlias = aliasInput.value.trim();
        
        if (playerAlias) {
            startModalEl.classList.add('hidden'); // Hide the start modal
            mainGameEl.classList.remove('hidden'); // Show the main game area
            startGame(); // Begin the game session
        }
    });
}


// --- Core Game Functions ---

// Get a random, unique card from the data set
function getRandomCard(excludeCard = null) {
    let newCard;
    do {
        newCard = TIKTOK_DATA[Math.floor(Math.random() * TIKTOK_DATA.length)];
    } while (excludeCard && newCard.name === excludeCard.name);
    return newCard;
}

// Set up the cards for the new round
function startGame() {
    currentRound = 1;
    currentStreak = 0;
    // Initialize first two cards
    cardA = getRandomCard();
    cardB = getRandomCard(cardA);

    // Ensure they are not the same creator
    while (cardA.name === cardB.name) {
        cardB = getRandomCard(cardA);
    }

    updateDisplay();
}

function updateDisplay(showValueB = false) {
    // Update the round info, including the player alias
    roundInfoEl.textContent = `Round ${currentRound}/${MAX_ROUNDS} | Current Streak: ${currentStreak} | Player: ${playerAlias}`;

    // Update Card A
    nameAEl.textContent = cardA.name;
    valueAEl.textContent = `${cardA.followers.toFixed(1)}M`;
    
    // Update Card B
    nameBEl.textContent = cardB.name;
    valueBEl.textContent = `${cardB.followers.toFixed(1)}M`;
    
    // Toggle Card B visibility
    valueBContainerEl.classList.toggle('hidden', !showValueB);
    
    // Re-enable/disable guess buttons
    document.querySelectorAll('.guess-btn').forEach(btn => btn.disabled = showValueB);
}

// Main game logic
window.makeGuess = function(guess) {
    const isHigher = cardB.followers > cardA.followers;
    const isLower = cardB.followers < cardA.followers;
    let correct = false;

    // Correct if the guess matches the reality, or if it's a tie
    if (cardB.followers === cardA.followers) {
        correct = true;
    } else if ((guess === 'higher' && isHigher) || (guess === 'lower' && isLower)) {
        correct = true;
    }

    // Show the actual value of Card B
    updateDisplay(true);

    if (correct) {
        currentStreak++;
        messageEl.textContent = `Correct! ${cardB.name} has ${cardB.followers.toFixed(1)}M followers.`;
        messageEl.className = 'message correct';

        if (currentRound < MAX_ROUNDS) {
            currentRound++;
            // Move Card B to Card A, and get a new Card B after a delay
            setTimeout(() => {
                cardA = cardB;
                cardB = getRandomCard(cardA);
                // Ensure the next Card B is not the same as Card A
                while (cardA.name === cardB.name) {
                    cardB = getRandomCard(cardA);
                }
                updateDisplay(false); // Hide Card B's value for the next round
                messageEl.className = 'hidden';
            }, 2500); 
        } else {
            endGame(); // Game finishes after 10 correct rounds
        }
    } else {
        messageEl.textContent = `Incorrect! ${cardB.name} has ${cardB.followers.toFixed(1)}M followers.`;
        messageEl.className = 'message incorrect';
        endGame();
    }
}

// End the game and show the modal
function endGame() {
    
    // Save the final score using the alias entered at the start
    saveScore(playerAlias, currentStreak);
    
    messageEl.textContent += ` Game Over! Final Streak: ${currentStreak}`;
    
    // Update the final score display
    finalScoreEl.innerHTML = `Congratulations, **${playerAlias}**! You achieved a final streak of **${currentStreak}**!`;
    
    // Show the Game Over modal
    setTimeout(() => {
        modalEl.classList.remove('hidden');
    }, 2500);
}

// Start the initialization process when the script loads
document.addEventListener('DOMContentLoaded', initGame);
