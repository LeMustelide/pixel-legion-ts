import { useStore, useStoreActions } from '../../hooks/useStore';
import { networkManager } from '../../net/socket';
import './MenuScreen.css';

export function MenuScreen() {
  const { playerName } = useStore();
  const { setPlayerName } = useStoreActions();
  
  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      alert('Veuillez entrer un nom de joueur');
      return;
    }
    
    try {
      await networkManager.connect();
      networkManager.joinGame(playerName);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      alert('Impossible de se connecter au serveur');
    }
  };

  return (
    <div className="menu-screen">
      <div className="menu-container">
        <h1 className="game-title">
          <span className="pixel-text">PIXEL</span>
          <span className="legion-text">LEGION</span>
        </h1>
        
        <div className="menu-content">
          <div className="player-setup">
            <h2>Configuration du joueur</h2>
            <div className="input-group">
              <label htmlFor="playerName">Nom du joueur</label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.currentTarget.value)}
                placeholder="Entrez votre nom..."
                maxLength={20}
              />
            </div>
          </div>
          
          <div className="menu-actions">
            <button
              className="btn btn-primary btn-large"
              onClick={handleJoinGame}
              disabled={!playerName.trim()}
            >
              Rejoindre une partie
            </button>
            
            <button className="btn btn-secondary">
              Paramètres
            </button>
            
            <button className="btn btn-secondary">
              Comment jouer
            </button>
          </div>
        </div>
        
        <div className="game-info">
          <p>Contrôlez votre spawner et vos groupes de pixels pour dominer l'arène !</p>
        </div>
      </div>
    </div>
  );
}
