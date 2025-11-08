// ====== Configuration ======
// Replace DATASET with fresh Philippine content from 2025.
// Each item needs: id, source, title, image, reactions (number), url (optional)
const DATASET = [
  {
    id: "tiktok-01",
    source: "TikTok",
    title: "Campus org flashmob at UP Diliman goes viral",
    image: "https://images.unsplash.com/photo-1515165562835-c4c2ff7c572f?q=80&w=1280&auto=format&fit=crop",
    reactions: 182000,
    url: "https://www.tiktok.com/"
  },
  {
    id: "ig-01",
    source: "Instagram",
    title: "Sunrise drone over Siargao boardwalk",
    image: "https://images.unsplash.com/photo-1507668077129-56e32907c685?q=80&w=1280&auto=format&fit=crop",
    reactions: 97000,
    url: "https://www.instagram.com/"
  },
  {
    id: "fb-01",
    source: "Facebook",
    title: "Community relief drive in Marikina",
    image: "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?q=80&w=1280&auto=format&fit=crop",
    reactions: 124000,
    url: "https://www.facebook.com/"
  },
  {
    id: "x-01",
    source: "X",
    title: "PBA buzzer-beater clip trending",
    image: "https://images.unsplash.com/photo-1521417531051-3203af8a8f3a?q=80&w=1280&auto=format&fit=crop",
    reactions: 65000,
    url: "https://x.com/"
  },
  {
    id: "yt-01",
    source: "YouTube",
    title: "Street food tour in Binondo",
    image: "https://images.unsplash.com/photo-1559070082-7d5cfae003f8?q=80&w=1280&auto=format&fit=crop",
    reactions: 210000,
    url: "https://www.youtube.com/"
  },
  {
    id: "tiktok-02",
    source: "TikTok",
    title: "Jeepney art timelapse",
    image: "https://images.unsplash.com/photo-1541410923090-5ec93fabc8f2?q=80&w=1280&auto=format&fit=crop",
    reactions: 133000,
    url: "https://www.tiktok.com/"
  }
];

// ====== Game state ======
let currentA = null;
let currentB = null;
let streak = 0;
let rounds = 0;

// Session streaks: stored in sessionStorage under "trendduel-streaks"
const STORAGE_KEY = "trendduel-streaks";

// ====== Helpers ======
function $(id){ return document.getElementById(id); }
function randomPair(){
  if (DATASET.length < 2) throw new Error("Need at least 2 items.");
  let i = Math.floor(Math.random()*DATASET.length);
  let j = i;
  while(j===i){ j = Math.floor(Math.random()*DATASET.length); }
  return [DATASET[i], DATASET[j]];
}
function formatReactions(n){
  if (n >= 1_000_000) return (n/1_000_000).toFixed(1)+"M";
  if (n >= 1_000) return (n/1_000).toFixed(1)+"K";
  return String(n);
}
function loadSession(){
  const raw = sessionStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}
function saveSession(streaks){
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(streaks));
}
function pushStreak(value){
  const streaks = loadSession();
  streaks.push({ value, at: Date.now() });
  streaks.sort((a,b)=> b.value - a.value || a.at - b.at);
  saveSession(streaks);
  renderStreaks();
}
function bestStreak(){
  const s = loadSession();
  return s.length ? s[0].value : 0;
}

// ====== UI rendering ======
function renderCards(){
  // A is revealed; B is hidden reactions
  $("sourceA").textContent = currentA.source;
  $("titleA").textContent = currentA.title;
  $("imageA").src = currentA.image;
  $("imageA").alt = `${currentA.source} preview`;
  $("metaA").textContent = `Reactions: ${formatReactions(currentA.reactions)}`;

  $("sourceB").textContent = currentB.source;
  $("titleB").textContent = currentB.title;
  $("imageB").src = currentB.image;
  $("imageB").alt = `${currentB.source} preview`;
  $("metaB").textContent = `Reactions: hidden`;
}

function renderScore(){
  $("currentStreak").textContent = streak;
  $("bestStreak").textContent = bestStreak();
  $("roundsPlayed").textContent = rounds;
}

function renderStreaks(){
  const list = $("streakList");
  const s = loadSession();
  list.innerHTML = "";
  if (!s.length){
    list.innerHTML = `<li>No streaks yet. Make a guess!</li>`;
    return;
  }
  s.forEach((item, idx)=>{
    const date = new Date(item.at);
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const li = document.createElement("li");
    li.innerHTML = `<strong>#${idx+1}:</strong> ${item.value} • ${time}`;
    list.appendChild(li);
  });
}

function newRound(){
  [currentA, currentB] = randomPair();
  renderCards();
  $("feedback").textContent = "";
  $("feedback").className = "feedback";
  renderScore();
}

// ====== Game logic ======
function handleGuess(isHigher){
  const bHigher = currentB.reactions > currentA.reactions;
  const correct = (isHigher && bHigher) || (!isHigher && !bHigher);
  rounds++;
  if (correct){
    streak++;
    $("feedback").textContent = `Correct! Post B has ${formatReactions(currentB.reactions)} reactions.`;
    $("feedback").className = "feedback ok";
    $("metaB").textContent = `Reactions: ${formatReactions(currentB.reactions)}`;
    // slight delay, then next round
    setTimeout(()=> newRound(), 900);
  } else {
    $("feedback").textContent = `Missed. Post B has ${formatReactions(currentB.reactions)} reactions.`;
    $("feedback").className = "feedback bad";
    $("metaB").textContent = `Reactions: ${formatReactions(currentB.reactions)}`;
    // store streak, reset, then start fresh
    if (streak > 0) pushStreak(streak);
    streak = 0;
    setTimeout(()=> newRound(), 1200);
  }
  renderScore();
}

// ====== Wire up ======
window.addEventListener("DOMContentLoaded", ()=>{
  // Info dialog
  const info = document.getElementById("infoDialog");
  document.getElementById("infoBtn").addEventListener("click", ()=> info.showModal());

  document.getElementById("guessHigher").addEventListener("click", ()=> handleGuess(true));
  document.getElementById("guessLower").addEventListener("click", ()=> handleGuess(false));

  document.getElementById("newGame").addEventListener("click", ()=>{
    streak = 0;
    rounds = 0;
    newRound();
    renderStreaks();
  });

  document.getElementById("resetSession").addEventListener("click", ()=>{
    sessionStorage.removeItem(STORAGE_KEY);
    renderStreaks();
    renderScore();
  });

  renderStreaks();
  newRound();
});
