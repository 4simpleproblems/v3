// gloobs.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Generate a unique ID and random color for this player
const id = "gloob_" + Math.random().toString(36).substring(2, 8);
const color = "#" + Math.floor(Math.random() * 16777215).toString(16);

// Starting position
let x = Math.random() * (canvas.width - 40) + 20;
let y = Math.random() * (canvas.height - 40) + 20;

// Write self into Firebase and ensure removal on disconnect
db.ref("players/" + id).set({ x, y, color });
db.ref("players/" + id).onDisconnect().remove();

// Handle movement keys
document.addEventListener("keydown", (e) => {
  const speed = 5;
  switch (e.key) {
    case "w": case "ArrowUp":    y = Math.max(20, y - speed); break;
    case "s": case "ArrowDown":  y = Math.min(canvas.height - 20, y + speed); break;
    case "a": case "ArrowLeft":  x = Math.max(20, x - speed); break;
    case "d": case "ArrowRight": x = Math.min(canvas.width - 20, x + speed); break;
  }
  db.ref("players/" + id).update({ x, y });
});

// Listen for all players and redraw
db.ref("players").on("value", (snapshot) => {
  const players = snapshot.val() || {};
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let pid in players) {
    const p = players[pid];
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
    ctx.fill();
  }
});
