// 1. แต้มสะสม
let scores = {
  typeA: 0,
  typeB: 0
};

let currentSceneIndex = 0;

// 2. ข้อมูลฉากเนื้อเรื่อง 
const storyScenes = [
  // ฉากที่ 1: หน้าเกริ่นนำ (ไม่มีรูป ไม่คิดคะแนน)
  {
    image: "", 
    text: "ปล่อยใจให้สบาย ออกผจญภัยเบาๆ\nค่อยๆ ซึมซับเรื่องราวที่จะสะท้อนตัวคุณ",
    choices: [
      { text: "ถัดไป ➜", type: null }
    ]
  },
  // ฉากที่ 2: มีตัวเลือกสะสมคะแนน
  {
    image: "https://placehold.co/400x250/png?text=Scene+1",
    text: "เจอทางแยกเล็กๆ กลางป่า",
    choices: [
      { text: "เดินเลียบแม่น้ำ", type: "typeA" },
      { text: "เดินไปทางทุ่งดอกไม้", type: "typeB" }
    ]
  },
  {
    image: "https://placehold.co/400x250/png?text=Scene+1",
    text: "เมื่อเดินตามทางมาคุณได้พบกลับสถานที่แห่งนึง คุณคิดว่าสถานที่นั้นคือ",
    choices: [
      { text: "กระท่อมอบอุ่น", type: "typeA" },
      { text: "ทะเลกว้างใหญ่", type: "typeB" }
    ]
  }
];

// 3. สรุปผลลัพธ์ (ตอนจบ)
const results = {
  typeA: {
    title: "A",
    desc: "รักความสงบ สบายๆ",
    image: "https://placehold.co/400x250/png?text=Result+A"
  },
  typeB: {
    title: "B",
    desc: "ร่าเริงสดใส",
    image: "https://placehold.co/400x250/png?text=Result+B"
  }
};

// 4. ระบบจัดการเสียง BGM (แก้เป็น const เรียบร้อย)
const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("music-toggle-btn");

if (bgm) {
  bgm.volume = 0.15;
}

// ฟังก์ชันเปิด/ปิดเสียง (สลับแค่ 2 จังหวะ: เปิด ♫ / ปิด ✕)
function toggleMusic() {
  if (!bgm || !musicBtn) return;

  if (!bgm.paused) {
    // กำลังเล่นอยู่ -> สั่งปิด
    bgm.pause();
    musicBtn.classList.add("muted");
    musicBtn.classList.remove("playing");
    musicBtn.innerText = "✕";
  } else {
    // ปิดอยู่ -> สั่งเปิด
    bgm.volume = 0.15;
    bgm.play().then(() => {
      musicBtn.classList.remove("muted");
      musicBtn.classList.add("playing");
      musicBtn.innerText = "♫";
    }).catch(e => console.log(e));
  }
}

if (musicBtn) {
  musicBtn.addEventListener("click", toggleMusic);
}

// ดักจับการแตะหน้าจอครั้งแรก (ไม่ว่าแตะที่ไหนก็ตาม ให้เพลงเริ่มเล่นและขึ้น ♫ ทันที)
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

// ฟังเสียงการแตะจอครั้งแรก
document.addEventListener("click", startAudioOnFirstInteraction, { once: true });

// ปุ่ม START
document.getElementById("start-btn").addEventListener("click", () => {
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("story-screen").classList.remove("hidden");
  showScene();
  
  // ให้แน่ใจว่าเพลงเล่นแน่นอน
  startAudioOnFirstInteraction();
});

// 6. แสดงฉากปัจจุบัน
function showScene() {
  const current = storyScenes[currentSceneIndex];
  const imgEl = document.getElementById("scene-img");

  // ตรวจสอบรูปภาพ ถ้าไม่มีรูปให้สั่งซ่อนทันที
  if (current.image && current.image !== "") {
    imgEl.src = current.image;
    imgEl.style.display = "block";
  } else {
    imgEl.src = "";
    imgEl.style.display = "none";
  }

  document.getElementById("story-text").innerText = current.text;

  const container = document.getElementById("choice-buttons");
  container.innerHTML = "";

  current.choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.innerText = choice.text;
    btn.onclick = () => selectChoice(choice.type);
    container.appendChild(btn);
  });
}

// 7. เมื่อผู้เล่นกดตัวเลือก
function selectChoice(type) {
  if (type) {
    scores[type] = (scores[type] || 0) + 1;
  }

  currentSceneIndex++;

  if (currentSceneIndex < storyScenes.length) {
    showScene();
  } else {
    showFinalResult();
  }
}

// 8. ประมวลผลและแสดงผลลัพธ์
function showFinalResult() {
  const finalType = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  const resultData = results[finalType] || results["typeA"];

  document.getElementById("story-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.remove("hidden");

  document.getElementById("result-title").innerText = resultData.title;
  document.getElementById("result-desc").innerText = resultData.desc;
  document.getElementById("result-img").src = resultData.image;
}

// 9. รีสตาร์ทเกม
function restartGame() {
  scores = { typeA: 0, typeB: 0 };
  currentSceneIndex = 0;
  
  document.getElementById("result-screen").classList.add("hidden");
  document.getElementById("start-screen").classList.remove("hidden");
}
