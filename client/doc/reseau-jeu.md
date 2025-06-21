# Architecture Réseau : Solo vs Multijoueur

Ce document décrit précisément le déroulement d'une action (ex : déplacement du joueur) dans le jeu, selon que l'on soit en mode **solo** ou **multijoueur**.

---

## Mode Solo (SoloNetwork)

**Résumé :**
Tout est géré localement, aucune communication réseau.

**Déroulement d'un déplacement :**
1. L'utilisateur clique sur le canvas du jeu.
2. La méthode `setupInput` de la classe `Game` appelle :
   ```js
   this.network.sendAction({ type: 'move', payload: { x, y } })
   ```
3. `SoloNetwork` reçoit l'action, modifie directement la position du joueur local dans son propre état (`this.state`).
4. `SoloNetwork` appelle le callback enregistré via `onState` pour notifier le jeu du nouvel état.
5. La méthode `syncState` de `Game` est appelée avec le nouvel état, ce qui met à jour le rendu via `GameRenderer`.

**Schéma :**
```
[UI click] → [Game.sendAction] → [SoloNetwork] → [état local modifié] → [callback onState] → [Game.syncState] → [GameRenderer]
```

---

## Mode Multijoueur (MultiplayerNetwork)

**Résumé :**
Le serveur est l'unique source de vérité. Toutes les actions passent par le réseau.

**Déroulement d'un déplacement :**
1. L'utilisateur clique sur le canvas du jeu.
2. La méthode `setupInput` de la classe `Game` appelle :
   ```js
   this.network.sendAction({ type: 'move', payload: { x, y } })
   ```
3. `MultiplayerNetwork` relaie l'action au serveur via Socket.IO (`sendAction`).
4. Le serveur traite l'action, met à jour l'état du jeu, puis diffuse le nouvel état à tous les clients via un événement `state`.
5. `MultiplayerNetwork` reçoit l'état du serveur et appelle le callback enregistré via `onState`.
6. La méthode `syncState` de `Game` est appelée avec le nouvel état, ce qui met à jour le rendu via `GameRenderer`.

**Schéma :**
```
[UI click] → [Game.sendAction] → [MultiplayerNetwork] → [Socket.IO] → [Serveur] → [état serveur modifié] → [broadcast state] → [MultiplayerNetwork] → [Game.syncState] → [GameRenderer]
```

---

## Points clés
- En solo, tout est instantané et local.
- En multi, le serveur valide et synchronise l'état pour tous les joueurs.
- L'interface `IGameNetwork` permet d'abstraire la logique réseau et d'utiliser le même code de jeu pour les deux modes.
