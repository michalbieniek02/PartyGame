import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000'); // Change this to your server URL

function App() {
  const [username, setUsername] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState([]);
  const [winner, setWinner] = useState('');

  useEffect(() => {
    socket.on('startRound', (data) => {
      setQuestion(data.question);
      setAnswers(data.answers);
    });

    socket.on('updateWinner', (data) => {
      setWinner(data.winner);
    });
  }, []);

  const createGame = () => {
    socket.emit('createGame', { username });
  };

  const joinGame = () => {
    socket.emit('joinGame', { username, lobbyCode });
  };

  const startRound = () => {
    socket.emit('startRound', { question: 'Question 1', alternativeQuestion: 'Question 2' });
  };

  const chooseWinner = (winner) => {
    socket.emit('chooseWinner', { winner });
  };

  return (
    <div className="App">
      <h1>React Game</h1>
      <div>
        <label>Username:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        <label>Lobby Code:</label>
        <input type="text" value={lobbyCode} onChange={(e) => setLobbyCode(e.target.value)} />
      </div>
      <button onClick={createGame}>Create Game</button>
      <button onClick={joinGame}>Join Game</button>

      {question && (
        <div>
          <h2>Round</h2>
          <p>Question: {question}</p>
          <ul>
            {answers.map((answer, index) => (
              <li key={index}>
                {answer.username}: {answer.answer}
              </li>
            ))}
          </ul>
          {winner && <p>Winner: {winner}</p>}
          <button onClick={startRound}>Start Round</button>
          {answers.length > 0 && <button onClick={() => chooseWinner(answers[0].username)}>Choose Winner</button>}
        </div>
      )}
    </div>
  );
}

export default App;
