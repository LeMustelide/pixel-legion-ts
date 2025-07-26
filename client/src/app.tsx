import { useEffect, useRef, useState } from 'preact/hooks'
import { connect } from '@net/socket';
import './app.css'
import { Game } from './core/game'
import { SoloNetwork } from './core/network/SoloNetwork';
import { MultiplayerNetwork } from './core/network/MultiplayerNetwork';

export function App() {
  const [isMultiplayer, setIsMultiplayer] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const gameContainer = useRef<HTMLDivElement>(null)
  const gameInstance = useRef<Game | null>(null)

  useEffect(() => {
    if (gameContainer.current && !gameInstance.current) {
      const initialNetwork = isMultiplayer ? new MultiplayerNetwork() : new SoloNetwork();
      if (isMultiplayer) connect();
      gameInstance.current = new Game(gameContainer.current, initialNetwork);
    }
  }, [])

  // Changement de mode réseau sans recréer le jeu
  useEffect(() => {
    if (!gameInstance.current) return;
    let network;
    if (isMultiplayer) {
      connect();
      network = new MultiplayerNetwork();
    } else {
      network = new SoloNetwork();
    }
    if (typeof gameInstance.current.setNetwork === 'function') {
      gameInstance.current.setNetwork(network);
    }
  }, [isMultiplayer])

  const handlePause = () => {
    if (gameInstance.current) {
      const newPausedState = !isPaused;
      setIsPaused(newPausedState);
      if (newPausedState) {
        gameInstance.current.pause();
      } else {
        gameInstance.current.resume();
      }
    }
  }

  return (
    <>
      <h1>Pixel legion</h1>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setIsMultiplayer(false)} disabled={!isMultiplayer}>
          Solo
        </button>
        <button onClick={() => setIsMultiplayer(true)} disabled={isMultiplayer}>
          Multijoueur
        </button>
        <button onClick={handlePause} style={{ marginLeft: 16 }}>
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>
      <div
        ref={gameContainer}
        style={{ width: 800, height: 600, margin: '0 auto' }}
      />
    </>
  )
}
