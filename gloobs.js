// Grab the canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Unique ID + bright-ish random color
const id    = "gloob_" + Math.random().toString(36).substr(2, 6);
const color = "#" + ((Math.random() * 0xaaaaaa) + 0x555555 | 0).toString(16);

// Random spawn inside bounds
let x = Math.random() * (canvas.width  - 40) + 20;
let y = Math.random() * (canvas.height - 40) + 20;

// Log for debugging
console.log("My Gloob ID:", id, "Color:", color, "Start:", { x, y });

// Write self to Firebase; auto‐remove on disconnect
db.ref(`players/${id}`).set({ x, y, color });
db.ref(`players/${id}`).onDisconnect().remove();

// Move on keypress
document.addEventListener("keydown", e => {
  const speed = 5;
  if (e.key === "w" || e.key === "ArrowUp")    y = Math.max(20, y - speed);
  if (e.key === "s" || e.key === "ArrowDown")  y = Math.min(canvas.height - 20, y + speed);
  if (e.key === "a" || e.key === "ArrowLeft")  x = Math.max(20, x - speed);
  if (e.key === "d" || e.key === "ArrowRight") x = Math.min(canvas.width  - 20, x + speed);
  db.ref(`players/${id}`).update({ x, y });
});

// Draw loop whenever any player data changes
db.ref("players").on("value", snapshot => {
  const players = snapshot.val() || {};
  console.log("All players data:", players);  // Debug: do you see your own id/color here?
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let pid in players) {
    const p = players[pid];
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
    ctx.fill();
  }
});
