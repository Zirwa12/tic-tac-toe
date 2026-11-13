
import { useEffect, useRef, useState } from "react";
import "./App.css";

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function getWinner(board) {
  for (const [a, b, c] of winningLines) {
    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return board[a];
    }
  }

  return null;
}

function minimax(board, depth, isMaximizing) {
  const winner = getWinner(board);

  if (winner === "O") return 10 - depth;
  if (winner === "X") return depth - 10;
  if (board.every((square) => square !== null)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;

    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        const nextBoard = [...board];
        nextBoard[i] = "O";

        const score = minimax(nextBoard, depth + 1, false);
        bestScore = Math.max(bestScore, score);
      }
    }

    return bestScore;
  }

  let bestScore = Infinity;

  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const nextBoard = [...board];
      nextBoard[i] = "X";

      const score = minimax(nextBoard, depth + 1, true);
      bestScore = Math.min(bestScore, score);
    }
  }

  return bestScore;
}

function findBestMove(board) {
  let bestScore = -Infinity;
  let bestMove = -1;

  const moveOrder = [4, 0, 2, 6, 8, 1, 3, 5, 7];

  for (const i of moveOrder) {
    if (board[i] === null) {
      const nextBoard = [...board];
      nextBoard[i] = "O";

      const score = minimax(nextBoard, 0, false);

      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
}

function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");
  const [scores, setScores] = useState({
    player: 0,
    computer: 0,
    draws: 0,
  });

  const scoreRecorded = useRef(false);

  const winner = getWinner(board);
  const isDraw = !winner && board.every((square) => square !== null);

  useEffect(() => {
    if (turn !== "O" || winner || isDraw) return;

    const timer = setTimeout(() => {
      const move = findBestMove(board);

      if (move !== -1) {
        const nextBoard = [...board];
        nextBoard[move] = "O";

        setBoard(nextBoard);
        setTurn("X");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [turn, board, winner, isDraw]);

  useEffect(() => {
    if ((!winner && !isDraw) || scoreRecorded.current) return;

    scoreRecorded.current = true;

    setScores((previousScores) => {
      if (winner === "X") {
        return { ...previousScores, player: previousScores.player + 1 };
      }

      if (winner === "O") {
        return { ...previousScores, computer: previousScores.computer + 1 };
      }

      return { ...previousScores, draws: previousScores.draws + 1 };
    });
  }, [winner, isDraw]);

  function handleSquareClick(index) {
    if (
      board[index] !== null ||
      winner ||
      isDraw ||
      turn !== "X"
    ) {
      return;
    }

    const nextBoard = [...board];
    nextBoard[index] = "X";

    setBoard(nextBoard);
    setTurn("O");
  }

  function resetGame() {
    scoreRecorded.current = false;
    setBoard(Array(9).fill(null));
    setTurn("X");
  }

  function resetScores() {
    setScores({ player: 0, computer: 0, draws: 0 });
  }

  let status = "Your turn — choose a square";

  if (winner === "X") status = "You win!";
  else if (winner === "O") status = "Computer wins!";
  else if (isDraw) status = "It's a draw!";
  else if (turn === "O") status = "Computer is thinking...";

  return (
    <main className="game-container">
      <header className="game-header">
        <p className="eyebrow">A game of skill and strategy</p>
        <h1>Tic-Tac-Toe</h1>
        <p>Can you beat the computer?</p>
      </header>

      <section className="scoreboard">
        <div className="score-card">
          <span>You · X</span>
          <strong>{scores.player}</strong>
        </div>

        <div className="score-card">
          <span>Draws</span>
          <strong>{scores.draws}</strong>
        </div>

        <div className="score-card">
          <span>Computer · O</span>
          <strong>{scores.computer}</strong>
        </div>
      </section>

      <p className="game-status">{status}</p>

      <div className="board">
        {board.map((square, index) => (
          <button
            key={index}
            className={`square ${square ? `square-${square.toLowerCase()}` : ""}`}
            onClick={() => handleSquareClick(index)}
            disabled={Boolean(square) || Boolean(winner) || isDraw || turn === "O"}
            type="button"
            aria-label={`Square ${index + 1}${square ? `: ${square}` : ""}`}
          >
            {square}
          </button>
        ))}
      </div>

      <button className="reset-button" onClick={resetGame}>
        New Game
      </button>

      <button className="score-reset-button" onClick={resetScores}>
        Reset Scores
      </button>
    </main>
  );
}

export default App;
