const grid = document.querySelector(".grid")
const hiddenGrid = document.querySelector(".hidden-grid")
const dialogBox = document.querySelector(".dialog-box")
let ROW_COUNT = 7
let COL_COUNT = 12
let colHoverIndex = null
let turn = true
let coordinates = []
const Board = {}
const HISTORY = []

function undo() {
	if (!turn) return
	if (HISTORY.length < 2) return
	// undo computers move
	let h = HISTORY.pop()
	Board.grid[h.i][h.j] = -1
	grid.children[COL_COUNT * h.i + h.j].style.backgroundColor = "white"
	// undo players move
	h = HISTORY.pop()
	Board.grid[h.i][h.j] = -1
	grid.children[COL_COUNT * h.i + h.j].style.backgroundColor = "white"
}

function reset(e) {
	ROW_COUNT = parseInt(e.parentNode.querySelector("input[name='rows']").value)
	COL_COUNT = parseInt(e.parentNode.querySelector("input[name='columns']").value)
	turn = true
	intializeGrid()
	initializeHoverPiece()
}

function updateGrid(i, j, color) {
	const COLOR = ["red", "blue"]
	HISTORY.push({ i, j })
	turn = !turn

	return new Promise(resolve => {
		// console.log(i, j)
		Board.colFilledIndex[j]++
		Board.grid[i][j] = color

		hiddenGrid.style.setProperty("--drop-row-count", i + 1)
		hiddenGrid.style.setProperty("--bg-color", COLOR[color])

		coordinates[j][2].style.visibility = "visible"
		coordinates[j][2].classList.add("move")
		setTimeout(() => {
			coordinates[j][2].classList.remove("move")
			coordinates[j][2].style.visibility = "hidden"
			grid.children[COL_COUNT * i + j].style.backgroundColor = COLOR[color]
			resolve()
		}, 500)
	})
}

function isGameOver() {
	// 0 player
	// 1 bot
	// 2 draw
	// -1 game not over
	let n = ROW_COUNT
	let m = COL_COUNT
	const isLeftFourSame = (i, j) => {
		if (j < 3) return false
		let x = Board.grid[i][j]
		if (Board.grid[i][j - 1] != x) return false
		if (Board.grid[i][j - 2] != x) return false
		if (Board.grid[i][j - 3] != x) return false
		return true
	}
	const isRightFourSame = (i, j) => {
		if (j > m - 4) return false
		let x = Board.grid[i][j]
		if (Board.grid[i][j + 1] != x) return false
		if (Board.grid[i][j + 2] != x) return false
		if (Board.grid[i][j + 3] != x) return false
		return true
	}
	const isBottomFourSame = (i, j) => {
		if (i > n - 4) return false
		let x = Board.grid[i][j]
		if (Board.grid[i + 1][j] != x) return false
		if (Board.grid[i + 2][j] != x) return false
		if (Board.grid[i + 3][j] != x) return false
		return true
	}
	const isLeftDiagonalFourSame = (i, j) => {
		if (j > m - 4 || i > n - 4) return false
		let x = Board.grid[i][j]
		if (Board.grid[i + 1][j + 1] != x) return false
		if (Board.grid[i + 2][j + 2] != x) return false
		if (Board.grid[i + 3][j + 3] != x) return false
		return true
	}
	const isRightDiagonalFourSame = (i, j) => {
		if (j < 3 || i > n - 4) return false
		let x = Board.grid[i][j]
		if (Board.grid[i + 1][j - 1] != x) return false
		if (Board.grid[i + 2][j - 2] != x) return false
		if (Board.grid[i + 3][j - 3] != x) return false
		return true
	}
	const possibleCases = [isLeftFourSame, isRightFourSame, isBottomFourSame, isLeftDiagonalFourSame, isRightDiagonalFourSame]

	for (let i = 0; i < n; i++) {
		for (let j = 0; j < m; j++) {
			if (Board.grid[i][j] != -1) {
				for (let k = 0; k < possibleCases.length; k++) {
					if (possibleCases[k](i, j)) {
						return Board.grid[i][j]
					}
				}
			}
		}
	}
	// check if any empty blocks are remaining
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < m; j++) {
			if (Board.grid[i][j] == -1) return -1
		}
	}
	return 2 // draw
}

function score(x) {
	const horizontalScore = (i, j) => {
		count = 0
		if (j < COL_COUNT && Board.grid[i][j++] == x) count++
		if (j < COL_COUNT && Board.grid[i][j++] == x) count++
		if (j < COL_COUNT && Board.grid[i][j++] == x) count++
		if (j < COL_COUNT && Board.grid[i][j++] == x) count++
		return points[count]
	}
	const verticalScore = (i, j) => {
		count = 0
		if (i < ROW_COUNT && Board.grid[i++][j] == x) count++
		if (i < ROW_COUNT && Board.grid[i++][j] == x) count++
		if (i < ROW_COUNT && Board.grid[i++][j] == x) count++
		if (i < ROW_COUNT && Board.grid[i++][j] == x) count++
		return points[count]
	}
	const leftDiagonalScore = (i, j) => {
		count = 0
		if (i < ROW_COUNT && j < COL_COUNT && Board.grid[i++][j++] == x) count++
		if (i < ROW_COUNT && j < COL_COUNT && Board.grid[i++][j++] == x) count++
		if (i < ROW_COUNT && j < COL_COUNT && Board.grid[i++][j++] == x) count++
		if (i < ROW_COUNT && j < COL_COUNT && Board.grid[i++][j++] == x) count++
		return points[count]
	}

	const rightDiagonalScore = (i, j) => {
		count = 0
		if (i < ROW_COUNT && j < COL_COUNT && Board.grid[i++][j--] == x) count++
		if (i < ROW_COUNT && j < COL_COUNT && Board.grid[i++][j--] == x) count++
		if (i < ROW_COUNT && j < COL_COUNT && Board.grid[i++][j--] == x) count++
		if (i < ROW_COUNT && j < COL_COUNT && Board.grid[i++][j--] == x) count++
		return points[count]
	}
	let total = 0
	const points = [0, 1, 2, 5, 10]

	for (let i = 0; i < ROW_COUNT; ++i) {
		for (let j = 0; j < COL_COUNT; j++) {
			if (Board.grid[i][j] == x) {
				total += horizontalScore(i, j)
				total += verticalScore(i, j)
				total += leftDiagonalScore(i, j)
				total += rightDiagonalScore(i, j)
				total -= 3
			}
		}
	}
	return total
}

// computer(0) maximize , player(1) minimize

function alphabeta(alpha, beta, maximize, depth) {
	if (depth > 3) return score(0) - score(1)
	if (maximize) {
		let maxVal = -Infinity
		for (let j = 0; j < COL_COUNT; j++) {
			let i = ROW_COUNT - Board.colFilledIndex[j] - 1
			if (i < 0) continue
			Board.colFilledIndex[j]++
			Board.grid[i][j] = 0

			let val = alphabeta(alpha, beta, false, depth + 1)
			maxVal = Math.max(maxVal, val)

			Board.colFilledIndex[j]--
			Board.grid[i][j] = -1

			alpha = Math.max(alpha, maxVal)
			if (alpha >= beta) break
		}
		return maxVal
	} else {
		let minVal = Infinity
		for (let j = 0; j < COL_COUNT; j++) {
			let i = ROW_COUNT - Board.colFilledIndex[j] - 1
			if (i < 0) continue
			Board.colFilledIndex[j]++
			Board.grid[i][j] = 1

			let val = alphabeta(alpha, beta, true, depth + 1)
			minVal = Math.min(minVal, val)

			Board.colFilledIndex[j]--
			Board.grid[i][j] = -1

			alpha = Math.min(alpha, minVal)
			if (alpha >= beta) break
		}
		return minVal
	}
}

function playBot() {
	let maxVal = -Infinity
	let bestJ = null
	for (let j = 0; j < COL_COUNT; j++) {
		let i = ROW_COUNT - Board.colFilledIndex[j] - 1
		if (i < 0) continue

		Board.colFilledIndex[j]++
		Board.grid[i][j] = 0

		let val = alphabeta(-Infinity, Infinity, false, 1)
		if (val > maxVal) {
			maxVal = val
			bestJ = j
		}

		Board.colFilledIndex[j]--
		Board.grid[i][j] = -1
	}

	i = ROW_COUNT - Board.colFilledIndex[bestJ] - 1
	return { i: i, j: bestJ }
}

function intializeGrid() {
	Board.colFilledIndex = Array(COL_COUNT).fill(0)
	Board.grid = Array(ROW_COUNT)
		.fill(-1)
		.map(e => Array(COL_COUNT).fill(-1))

	hiddenGrid.innerHTML = ""
	hiddenGrid.style.setProperty("--col-count", COL_COUNT)
	for (let i = 0; i < COL_COUNT; i++) {
		const div = document.createElement("div")
		hiddenGrid.appendChild(div)
	}
	grid.innerHTML = ""
	grid.style.setProperty("--row-count", ROW_COUNT)
	grid.style.setProperty("--col-count", COL_COUNT)
	for (let i = 0; i < ROW_COUNT * COL_COUNT; i++) {
		const div = document.createElement("div")
		div.id = i
		grid.appendChild(div)
	}
}

function initializeHoverPiece() {
	coordinates = []
	Array.from(hiddenGrid.children).forEach(div => {
		const { left, right } = div.getBoundingClientRect()
		coordinates.push([left, right, div])
	})
	window.onresize = () => {
		coordinates = []
		Array.from(hiddenGrid.children).forEach(div => {
			const { left, right } = div.getBoundingClientRect()
			coordinates.push([left, right, div])
		})
	}
	document.onmousemove = ({ x }) => {
		if (!turn) return
		coordinates.forEach(([left, right, ele], index) => {
			hiddenGrid.style.setProperty("--bg-color", "blue")
			if (left < x && x < right) {
				ele.style.visibility = "visible"
				colHoverIndex = index
			} else if (!ele.classList.contains("move")) ele.style.visibility = "hidden"
		})
	}
}

function main() {
	// create grid UI
	intializeGrid()
	// show hidden pieces on hover
	initializeHoverPiece() // updates colHoverIndex on mousemove

	// on click play
	const END_STATE = ["You Lose", "You Win", "Draw"]
	grid.addEventListener("click", async e => {
		if (colHoverIndex != null && turn) {
			i = ROW_COUNT - Board.colFilledIndex[colHoverIndex] - 1
			j = colHoverIndex

			await updateGrid(i, j, 1)

			let state = isGameOver()
			if (state > -1) {
				dialogBox.querySelector("h3").innerText = END_STATE[state]
				dialogBox.style.display = "flex"
				return
			}

			let p = playBot()

			await updateGrid(p.i, p.j, 0)

			state = isGameOver()

			if (state > -1) {
				dialogBox.querySelector("h3").innerText = END_STATE[state]
				dialogBox.style.display = "flex"
				turn = false
				return
			}
		}
	})
}

main()
