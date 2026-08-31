let currentLang = 'th';

const uiText = {
  th: {
    startTitle: "เลือกคำตอบที่ตรงกับใจเพื่อค้นหาตัวตนของคุณ",
    startBtn: "เริ่มเลย ➜",
    restartBtn: "เล่นใหม่อีกครั้ง ↺"
  },
  ja: {
    startTitle: "直感で答えて、あなたの和菓子タイプを見つけよう",
    startBtn: "はじめる ➜",
    restartBtn: "もう一度あそぶ ↺"
  }
};

let scores = { typeA: 0, typeB: 0 };
let currentSceneIndex = 0;
let choiceHistory = [];

const storyScenes = [
  {
    image: "", 
    text: {
      th: "ปล่อยใจให้สบาย ออกผจญภัยเบาๆ\nค่อยๆ ซึมซับเรื่องราวที่จะสะท้อนตัวคุณ",
      ja: "心を落ち着かせて、小さな旅へ出かけましょう。\n物語があなたの心を映し出します。"
    },
    choices: [
      { text: { th: "ถัดไป ➜", ja: "次へ ➜" }, type: null }
    ]
  },
  {
    image: "https://placehold.co/400x250/png?text=Scene+1",
    text: {
      th: "เจอทางแยกเล็กๆ กลางป่า",
      ja: "森の中で小さな分かれ道を見つけました。"
    },
    choices: [
      { text: { th: "เดินเลียบแม่น้ำ", ja: "川沿いを歩く" }, type: "typeA" },
      { text: { th: "เดินไปทางทุ่งดอกไม้", ja: "お花畑の方へ進む" }, type: "typeB" }
    ]
  },
  {
    image: "https://placehold.co/400x250/png?text=Scene+2",
    text: {
      th: "เมื่อเดินตามทางมาคุณได้พบกับสถานที่แห่งหนึ่ง คุณคิดว่าสถานที่นั้นคือ",
      ja: "道を歩いていると、ある場所にたどり着きました。そこはどんな場所？"
    },
    choices: [
      { text: { th: "กระท่อมอบอุ่น", ja: "あたたかい小屋" }, type: "typeA" },
      { text: { th: "ทะเลกว้างใหญ่", ja: "広大な海" }, type: "typeB" }
    ]
  }
];

const results = {
  typeA: {
    title: { th: "ไดฟุกุ (Daifuku)", ja: "大福（だいふく）" },
    desc: { th: "รักความสงบ นุ่มนวล อบอุ่น สบายใจเมื่อได้อยู่คนเดียว", ja: "優しくて温かい、穏やかな心の持ち主。" },
    image: "https://placehold.co/400x250/png?text=Daifuku"
  },
  typeB: {
    title: { th: "ดังโงะ (Dango)", ja: "団子（だんご）" },
    desc: { th: "ร่าเริงสดใส เข้ากับทุกคนได้ง่าย เต็มไปด้วยพลังบวก", ja: "明るく元気で、誰とでもすぐに仲良くなれる人気者。" },
    image: "https://placehold.co/400x250/png?text=Dango"
  }
};

function changeLanguage(lang) {
  currentLang = lang;
  
  if (lang === 'ja') {
    document.body.classList.add('lang-ja');
  } else {
    document.body.classList.remove('lang-ja');
  }

  document.getElementById("lang-btn-th").classList.toggle("active", lang === 'th');
  document.getElementById("lang-btn-ja").classList.toggle("active", lang === 'ja');
  
  document.getElementById("start-title").innerText = uiText[lang].startTitle;
  document.getElementById("start-btn").innerText = uiText[lang].startBtn;
  document.getElementById("restart-btn").innerText = uiText[lang].restartBtn;

  if (!document.getElementById("story-screen").classList.contains("hidden")) {
    showScene();
  }
  if (!document.getElementById("result-screen").classList.contains("hidden")) {
    showFinalResult();
  }
}

// BGM
const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("music-toggle-btn");

if (bgm) bgm.volume = 0.15;

function toggleMusic() {
  if (!bgm || !musicBtn) return;
  if (!bgm.paused) {
    bgm.pause();
    musicBtn.classList.add("muted");
    musicBtn.classList.remove("playing");
    musicBtn.innerText = "✕";
  } else {
    bgm.volume = 0.15;
    bgm.play().then(() => {
      musicBtn.classList.remove("muted");
      musicBtn.classList.add("playing");
      musicBtn.innerText = "♫";
    }).catch(e => console.log(e));
  }
}

if (musicBtn) musicBtn.addEventListener("click", toggleMusic);

function startAudioOnFirstInteraction() {
  if (bgm && bgm.paused) {
    bgm.volume = 0.15;
    bgm.play().then(() => {
      if (musicBtn) {
        musicBtn.classList.remove("muted");
        musicBtn.classList.add("playing");
        musicBtn.innerText = "♫";
      }
    }).catch(e => console.log("Autoplay waiting for click:", e));
  }
}

document.addEventListener("click", startAudioOnFirstInteraction, { once: true });

// เริ่มเกม
function startGame() {
  currentSceneIndex = 0;
  choiceHistory = [];
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("story-screen").classList.remove("hidden");
  showScene();
  startAudioOnFirstInteraction();
}

// กดย้อนกลับทีเดียวแบบ Direct
function goBackStep() {
  if (currentSceneIndex > 0) {
    currentSceneIndex--;
    choiceHistory.pop(); // ลบคำตอบข้อล่าสุด
    showScene();
  } else {
    // อยู่ข้อแรกแล้วกด ให้กลับหน้าเริ่มเกม
    restartGame();
  }
}

function showScene() {
  const current = storyScenes[currentSceneIndex];
  const storyScreen = document.getElementById("story-screen");
  const imgEl = document.getElementById("scene-img");
  const backBtn = document.getElementById("floating-back-btn");

  if (backBtn) backBtn.classList.remove("hidden");

  const progressPercent = ((currentSceneIndex + 1) / storyScenes.length) * 100;
  const progressBar = document.getElementById("progress-bar");
  if (progressBar) progressBar.style.width = `${progressPercent}%`;

  storyScreen.classList.remove("fade-in");
  void storyScreen.offsetWidth; 
  storyScreen.classList.add("fade-in");

  if (current.image && current.image !== "") {
    imgEl.src = current.image;
    imgEl.style.display = "block";
  } else {
    imgEl.src = "";
    imgEl.style.display = "none";
  }

  document.getElementById("story-text").innerText = current.text[currentLang];

  const container = document.getElementById("choice-buttons");
  container.innerHTML = "";

  current.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.innerText = choice.text[currentLang];
    btn.onclick = () => selectChoice(choice.type);
    container.appendChild(btn);
  });
}

function selectChoice(type) {
  choiceHistory.push(type);
  currentSceneIndex++;

  if (currentSceneIndex < storyScenes.length) {
    showScene();
  } else {
    showFinalResult();
  }
}

function calculateScores() {
  scores = { typeA: 0, typeB: 0 };
  choiceHistory.forEach(type => {
    if (type) scores[type] = (scores[type] || 0) + 1;
  });
}

function showFinalResult() {
  calculateScores();
  const finalType = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  const resultData = results[finalType] || results["typeA"];

  const resultScreen = document.getElementById("result-screen");
  const backBtn = document.getElementById("floating-back-btn");

  if (backBtn) backBtn.classList.add("hidden");

  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("story-screen").classList.add("hidden");
  
  resultScreen.classList.remove("hidden");
  resultScreen.classList.remove("fade-in");
  void resultScreen.offsetWidth;
  resultScreen.classList.add("fade-in");

  document.getElementById("result-title").innerText = resultData.title[currentLang];
  document.getElementById("result-desc").innerText = resultData.desc[currentLang];
  document.getElementById("result-img").src = resultData.image;
}

function restartGame() {
  scores = { typeA: 0, typeB: 0 };
  currentSceneIndex = 0;
  choiceHistory = [];

  const backBtn = document.getElementById("floating-back-btn");
  if (backBtn) backBtn.classList.add("hidden");

  const progressBar = document.getElementById("progress-bar");
  if (progressBar) progressBar.style.width = "0%";

  document.getElementById("story-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.add("hidden");
  
  const startScreen = document.getElementById("start-screen");
  startScreen.classList.remove("hidden");
  startScreen.classList.remove("fade-in");
  void startScreen.offsetWidth;
  startScreen.classList.add("fade-in");
}
