import { GameService } from '../GameService';
import { GameConfig } from '../config/GameConfig';

// Petit script manuel de simulation (à exécuter avec ts-node si configuré)
const logs: string[] = [];
const svc = new GameService((state) => {
  const players = Object.values(state.players);
  if (players.length === 2) {
    const a = players[0];
    const b = players[1];
    const ga = a.pixelGroups[0];
    const gb = b.pixelGroups[0];
    logs.push(`tick: A=${ga?.pixelCount ?? 0} B=${gb?.pixelCount ?? 0}`);
    if (!ga || !gb) {
      logs.push('Combat terminé');
      console.log(logs.slice(-10).join('\n'));
    }
  }
}, 50);

svc.addPlayer('A');
svc.addPlayer('B');

// Force un spawn initial (on imite l'attente du timer de spawn)
const pA = (svc as any).getPlayer('A');
const pB = (svc as any).getPlayer('B');

pA?.spawnPixelGroup(30, 'red');
pB?.spawnPixelGroup(25, 'blue');

// Place les groupes proches pour déclencher l'attaque
if (pA?.pixelGroups[0] && pB?.pixelGroups[0]) {
  pA.pixelGroups[0].x = 0; pA.pixelGroups[0].y = 0;
  pB.pixelGroups[0].x = 50; pB.pixelGroups[0].y = 0; // < RANGE (100)
}

// Arrête la simulation après quelques secondes
setTimeout(() => {
  svc.dispose();
  console.log('--- Résumé combat ---');
  console.log(logs.slice(-20).join('\n'));
}, 4000);
