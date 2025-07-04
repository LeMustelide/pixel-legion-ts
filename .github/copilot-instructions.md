# Guide d'architecture et de développement du client Pixel Legion

## 1. Architecture générale

- **Client/Serveur** : Le client n'est qu'une "vue" de l'état du jeu. Toute la logique d'évolution de l'état (déplacement, règles, etc.) est centralisée côté serveur (ou simulée localement en solo).
- **Abstraction réseau** : Le client utilise l'interface `IGameNetwork` pour communiquer avec le serveur (réel ou simulé). Cela permet de basculer entre solo et multi sans changer la logique du jeu.
- **Rendu** : Le rendu (affichage des joueurs, etc.) est découplé de la logique réseau et de l'état du jeu, via la classe `GameRenderer`.

## 2. Modes de jeu

- **Multijoueur** :
  - Le client envoie des intentions d'action (ex : déplacement) via `MultiplayerNetwork`.
  - Le serveur traite les actions, anime les déplacements, et diffuse l'état courant à tous les clients.
  - Le client ne fait qu'afficher l'état reçu.

- **Solo** :
  - Le client envoie des intentions d'action à un "serveur local" (`SoloServer`) via `SoloNetwork`.
  - `SoloServer` anime les déplacements et applique les règles comme le vrai serveur.
  - Le client reçoit l'état courant et l'affiche.

## 3. Principes de développement

- **Unification des flux** :
  - Le client ne doit jamais animer ou modifier l'état du jeu directement.
  - Toute modification d'état passe par une intention envoyée au serveur (ou au serveur local en solo).
  - Le client ne fait qu'afficher l'état reçu.

- **Ajout de fonctionnalités** :
  - Pour ajouter une nouvelle action (ex : attaque, sélection), il faut :
    1. Définir l'intention côté client (ex : `sendAction({ type: 'attack', ... })`).
    2. Implémenter la logique côté serveur (ou dans `SoloServer` pour le solo).
    3. S'assurer que l'état est bien renvoyé et affiché côté client.

- **Tests et debug** :
  - Le mode solo permet de tester toute la logique serveur localement, sans backend.
  - Les logs côté `SoloNetwork`/`SoloServer` aident à comprendre le flux d'action.

## 4. Où coder quoi ?

- **Client** :
  - UI, gestion des entrées utilisateur, envoi d'intentions d'action, rendu de l'état.
- **IGameNetwork** :
  - Abstraction réseau, ne jamais mettre de logique métier ici.
- **SoloServer** :
  - Toute la logique métier (déplacement, règles, etc.) pour le mode solo.
- **Serveur (multi)** :
  - Toute la logique métier (déplacement, règles, etc.) pour le mode multi.

## 5. À retenir

- Le client ne "triche" jamais : il ne fait qu'afficher ce que le serveur (ou SoloServer) lui dit.
- Pour toute évolution, penser d'abord à la logique serveur, puis à l'intention côté client.
- Garder la séparation claire entre intention (client) et traitement (serveur/SoloServer).

---

Pour toute nouvelle fonctionnalité, inspirez-vous de la structure existante pour garantir la cohérence et la maintenabilité du code.
