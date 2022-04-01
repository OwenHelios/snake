const canvas = document.createElement('canvas')
const overlay = document.querySelector('.overlay')
const btn = document.querySelector('button')
const c = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
document.body.append(canvas)

//Frame rate = frames per second
const FRAME_RATE = 5
//Set interval unit to milliseconds
const INTERVAL = 1000 / FRAME_RATE
const BLOCK_SIZE = 26
const GAP = 1
var req
var player
var gameIsRunning = false
var inputs = []
var GRID_SIZE = {
  x: Math.floor(canvas.width / BLOCK_SIZE),
  y: Math.floor(canvas.height / BLOCK_SIZE),
}
var STARTING_POSITION = {
  x: Math.floor(GRID_SIZE.x / 2) - 1,
  y: Math.floor(GRID_SIZE.y / 2) - 1,
}

var padding = {
  x: (canvas.width % BLOCK_SIZE) / 2,
  y: (canvas.height % BLOCK_SIZE) / 2,
}

var foodPositions = generateFood(5)

function onWindowResize() {
  overlay.style.width = canvas.width + 'px'
  overlay.style.height = canvas.height + 'px'
  if (player.checkDeath()) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  if (!gameIsRunning) init()
  STARTING_POSITION = {
    x: canvas.width / 2 - BLOCK_SIZE / 2,
    y: canvas.height / 2 - BLOCK_SIZE / 2,
  }
  GRID_SIZE = {
    x: Math.floor(canvas.width / BLOCK_SIZE),
    y: Math.floor(canvas.height / BLOCK_SIZE),
  }
  padding = {
    x: (canvas.width % BLOCK_SIZE) / 2,
    y: (canvas.height % BLOCK_SIZE) / 2,
  }
  foodPositions = generateFood(5)
}

class Snake {
  constructor({ position, direction, length }) {
    this.position = position
    this.direction = direction
    this.length = length
    this.tail = []
  }
  draw() {
    // Draw Head
    c.fillStyle = 'blue'
    c.fillRect(
      this.position.x * BLOCK_SIZE + GAP + padding.x,
      this.position.y * BLOCK_SIZE + GAP + padding.y,
      BLOCK_SIZE - GAP * 2,
      BLOCK_SIZE - GAP * 2
    )
    // Draw Tail
    for (let tailBlock of this.tail) {
      c.fillRect(
        tailBlock.x * BLOCK_SIZE + GAP + padding.x,
        tailBlock.y * BLOCK_SIZE + GAP + padding.y,
        BLOCK_SIZE - GAP * 2,
        BLOCK_SIZE - GAP * 2
      )
    }
  }
  update() {
    this.tail.unshift({ ...this.position })
    this.tail.pop()
    this.position.x += this.direction.x
    this.position.y += this.direction.y
    this.draw()
  }
  canEat(foodPosition) {
    return (
      this.position.x == foodPosition.x && this.position.y == foodPosition.y
    )
  }
  checkDeath() {
    if (
      this.position.x >= GRID_SIZE.x ||
      this.position.x < 0 ||
      this.position.y >= GRID_SIZE.y ||
      this.position.y < 0
    )
      return true
    for (let tailBlock of this.tail) {
      if (this.position.x == tailBlock.x && this.position.y == tailBlock.y)
        return true
    }
    return false
  }
}

// let startTime, lastTime
function animate() {
  // req = requestAnimationFrame(animate)
  // if (startTime === undefined) {
  //   startTime = timeStamp
  //   lastTime = startTime
  // }
  // if (timeStamp - lastTime < INTERVAL) return
  // lastTime = timeStamp
  c.clearRect(0, 0, canvas.width, canvas.height)
  c.fillStyle = '#333'
  c.fillRect(0, 0, canvas.width, canvas.height)
  drawBoundary()
  renderFood()
  // Change direction to match each queued-up input to avoid bugs at slow game speed
  if (inputs.length > 0) {
    setDirection(inputs[0])
    inputs.shift()
  }
  player.update()
  if (player.checkDeath()) {
    c.font = 'bold 40px serif'
    c.strokeStyle = '#39ff14'
    c.strokeText(
      'Game Over',
      (canvas.width - 220) / 2,
      (canvas.height - 40) / 2
    )
    overlay.classList.remove('hidden')
    clearInterval(interval)
    // cancelAnimationFrame(req)
  }
}

function generateFood(num) {
  const foodPositions = []
  for (let i = 0; i < num; i++) {
    let randomPosition = {
      x: Math.floor(Math.random() * GRID_SIZE.x),
      y: Math.floor(Math.random() * GRID_SIZE.y),
    }
    // Check Duplicate Positions
    while (
      foodPositions.some(
        f => f.x == randomPosition.x && f.y == randomPosition.y
      )
    ) {
      randomPosition = {
        x: Math.floor(Math.random() * GRID_SIZE.x),
        y: Math.floor(Math.random() * GRID_SIZE.y),
      }
    }
    foodPositions.push(randomPosition)
  }
  return foodPositions
}

function renderFood() {
  for (let foodPosition of foodPositions) {
    if (player.canEat(foodPosition)) {
      foodPositions = foodPositions.filter(f => f != foodPosition)
      foodPositions.push(generateFood(1)[0])
      player.tail.push(player.position)
      continue
    }
    const grd = c.createLinearGradient(
      foodPosition.x * BLOCK_SIZE + padding.x,
      foodPosition.y * BLOCK_SIZE + padding.y,
      (foodPosition.x + 1) * BLOCK_SIZE + padding.x,
      (foodPosition.y + 1) * BLOCK_SIZE + padding.y
    )
    grd.addColorStop(0, '#facdc4')
    grd.addColorStop(1, '#fa5433')
    c.fillStyle = grd
    c.strokeStyle = 'white'

    c.strokeRect(
      foodPosition.x * BLOCK_SIZE + padding.x + GAP,
      foodPosition.y * BLOCK_SIZE + padding.y + GAP,
      BLOCK_SIZE - GAP * 2,
      BLOCK_SIZE - GAP * 2
    )
    c.fillRect(
      foodPosition.x * BLOCK_SIZE + padding.x + GAP,
      foodPosition.y * BLOCK_SIZE + padding.y + GAP,
      BLOCK_SIZE - GAP * 2,
      BLOCK_SIZE - GAP * 2
    )
  }
}

function drawBoundary() {
  c.strokeStyle = 'blue'
  c.lineWidth = 2
  c.strokeRect(
    padding.x,
    padding.y,
    canvas.width - padding.x * 2,
    canvas.height - padding.y * 2
  )
}

function init() {
  startTime = null
  lastTime = null
  c.clearRect(0, 0, canvas.width, canvas.height)
  c.fillStyle = '#333'
  c.fillRect(0, 0, canvas.width, canvas.height)
  drawBoundary()
  player = new Snake({
    position: STARTING_POSITION,
    direction: {
      x: 1,
      y: 0,
    },
    length: 1,
  })
  console.log(JSON.parse(JSON.stringify(player)))
}

init()
const interval = setInterval(animate, 200)
btn.addEventListener('click', () => {
  c.clearRect(0, 0, canvas.width, canvas.height)
  overlay.classList.toggle('hidden')
  gameIsRunning = !gameIsRunning
  init()
  // console.log(player)
  animate()
})
addEventListener('keydown', handleKeydown)
addEventListener('resize', onWindowResize, false)
function handleKeydown({ key }) {
  switch (key) {
    case 'w':
    case 'ArrowUp':
      inputs.push('up')
      break
    case 'a':
    case 'ArrowLeft':
      inputs.push('left')
      break
    case 's':
    case 'ArrowDown':
      inputs.push('down')
      break
    case 'd':
    case 'ArrowRight':
      inputs.push('right')
      break
  }
}

function setDirection(input) {
  switch (input) {
    case 'up':
      if (player.direction.y == 1) return
      player.direction.x = 0
      player.direction.y = -1
      break
    case 'left':
      if (player.direction.x == 1) return
      player.direction.x = -1
      player.direction.y = 0
      break
    case 'down':
      if (player.direction.y == -1) return
      player.direction.x = 0
      player.direction.y = 1
      break
    case 'right':
      if (player.direction.x == -1) return
      player.direction.x = 1
      player.direction.y = 0
      break
  }
}
