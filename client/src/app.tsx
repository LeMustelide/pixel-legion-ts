import { useEffect, useRef, useState } from 'preact/hooks'
import { connect } from '@net/socket';
import './app.css'
import { Game } from './core/game'
import { SoloNetwork } from './core/network/SoloNetwork';
import { MultiplayerNetwork } from './core/network/MultiplayerNetwork';

export function App() {
  const [count, setCount] = useState(0)
  const [isMultiplayer, setIsMultiplayer] = useState(false)
  const gameContainer = useRef<HTMLDivElement>(null)
  const gameInstance = useRef<Game | null>(null)

  // Création du jeu une seule fois
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
      </div>
      <div
        ref={gameContainer}
        style={{ width: 800, height: 600, margin: '0 auto' }}
      />
      <div class="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/app.tsx</code> and save to test HMR
        </p>
      </div>
      <p>
        Check out{' '}
        <a
          href="https://preactjs.com/guide/v10/getting-started#create-a-vite-powered-preact-app"
          target="_blank"
        >
          create-preact
        </a>
        , the official Preact + Vite starter
      </p>
      <p class="read-the-docs">
        Click on the Vite and Preact logos to learn more
      </p>
    </>
  )
}
