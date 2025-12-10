// 游戏设置
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const box = 20;              // 每格像素
const rows = 20, cols = 20;  // 网格数
let snake, direction, food, score, gameInterval, isGameOver, nextDirection;
let isSuperMode = false;

function randomPosition() {
  let x, y;
  do {
    x = Math.floor(Math.random() * cols);
    y = Math.floor(Math.random() * rows);
  } while (snake && snake.some(s => s.x === x && s.y === y));
  return {x, y};
}

function setGameSpeed(ms) {
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, ms);
}

function resetGame() {
  snake = [
    {x: 7, y: 10},
    {x: 6, y: 10},
    {x: 5, y: 10}
  ];
  direction = 'RIGHT';
  nextDirection = 'RIGHT';
  food = randomPosition();
  score = 0;
  isSuperMode = false;
  isGameOver = false;
  document.getElementById('game-over').style.display = 'none';
  document.getElementById('score').textContent = '分数：' + score;
  document.getElementById('restart-btn').style.display="none";
  canvas.style.background = "#191a1d";
  setGameSpeed(90);
  draw();
  playBGM(); // 播放背景音乐
}

function drawCell(x, y, color, radius=6) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x * box + box/2, y * box + box/2);
  ctx.arc(x * box + box / 2, y * box + box / 2, box/2-radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSnake() {
  for (let i = 0; i < snake.length; i++) {
    drawCell(snake[i].x, snake[i].y, i===0 ? "#FFEB3B" : "#FFFF00", i===0 ? 3:6);
  }
}

function drawFood() {
  ctx.save();
  // 画一个红色的小苹果
  ctx.beginPath();
  ctx.arc(food.x * box + box/2, food.y * box + box/2, box/2-7, 0, Math.PI * 2);
  ctx.fillStyle = "#FF0000";
  ctx.shadowColor = "#f00";
  ctx.shadowBlur = 10;
  ctx.fill();
  // 小叶子
  ctx.beginPath();
  ctx.moveTo(food.x * box + box/2, food.y * box + box/2 - 6);
  ctx.lineTo(food.x * box + box/2 + 3, food.y * box + box/2 - 12);
  ctx.lineTo(food.x * box + box/2, food.y * box + box/2 - 11);
  ctx.closePath();
  ctx.fillStyle = "#7bdb61";
  ctx.shadowBlur = 0;
  ctx.fill();
  ctx.restore();
}

function draw() {
  // 绘制背景
  ctx.clearRect(0, 0, cols*box, rows*box);
  ctx.save();
  // 画棋盘格
  for(let y=0;y<rows;y++) {
    for(let x=0;x<cols;x++) {
      ctx.fillStyle = (x+y)%2===0 ? "#22252B" : "#1D2026";
      ctx.fillRect(x*box, y*box, box, box);
    }
  }
  ctx.restore();
  drawSnake();
  drawFood();
}

function moveSnake() {
  let head = { ...snake[0] };
  if (nextDirection === 'LEFT' && direction!=='RIGHT') direction = 'LEFT';
  if (nextDirection === 'UP' && direction!=='DOWN') direction = 'UP';
  if (nextDirection === 'RIGHT' && direction!=='LEFT') direction = 'RIGHT';
  if (nextDirection === 'DOWN' && direction!=='UP') direction = 'DOWN';

  if (direction === 'LEFT') head.x--;
  else if (direction === 'RIGHT') head.x++;
  else if (direction === 'UP') head.y--;
  else if (direction === 'DOWN') head.y++;

  // 检查撞墙或撞到自己
  if (
    head.x < 0 || head.x >= cols ||
    head.y < 0 || head.y >= rows ||
    snake.some(s=>s.x===head.x && s.y===head.y)
  ) {
    isGameOver = true;
    clearInterval(gameInterval);
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('restart-btn').style.display="inline-block";
    return;
  }

  snake.unshift(head);
  // 吃到食物
  if (head.x === food.x && head.y === food.y) {
    food = randomPosition();
    score += 1;
    document.getElementById('score').textContent = '分数：' + score;
    if (!isSuperMode && score > 50) {
      isSuperMode = true;
      setGameSpeed(50);
      canvas.style.background = "#880022";
    }
  } else {
    snake.pop();
  }
}

function gameLoop() {
  if(isGameOver) return;
  moveSnake();
  draw();
}

// 键盘控制
  document.addEventListener('keydown', function(e){
    let key = e.key;
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') nextDirection = 'LEFT';
    else if (key === 'ArrowUp' || key === 'w' || key === 'W') nextDirection = 'UP';
    else if (key === 'ArrowRight' || key === 'd' || key === 'D') nextDirection = 'RIGHT';
    else if (key === 'ArrowDown' || key === 's' || key === 'S') nextDirection = 'DOWN';
    e.preventDefault();
  });

// 重新开始按钮
  document.getElementById('restart-btn').onclick = resetGame;

// 支持移动端滑动方向控制
(function() {
  let sx=0, sy=0;
  canvas.addEventListener('touchstart', function(e){
    if(e.touches.length===1){
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    }
  });
  canvas.addEventListener('touchmove', function(e){
    if(e.touches.length===1){
      let dx = e.touches[0].clientX-sx, dy = e.touches[0].clientY-sy;
      if(Math.abs(dx)>Math.abs(dy)){
        if(dx > 20) nextDirection = 'RIGHT';
        else if(dx < -20) nextDirection = 'LEFT';
      } else {
        if(dy > 20) nextDirection = 'DOWN';
        else if(dy < -20) nextDirection = 'UP';
      }
    }
  });
})();

function playBGM() {
  const audio = document.getElementById('bgm');
  if(audio){
    audio.volume = 0.5;
    if(audio.paused) audio.play();
  }
}

// 游戏初始化
resetGame();
