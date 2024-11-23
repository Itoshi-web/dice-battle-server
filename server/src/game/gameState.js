export function initializeGameState(players) {
  return {
    players: players.map(p => ({
      id: p.id,
      username: p.username,
      eliminated: false,
      firstMove: true,
      cells: Array(players.length).fill().map(() => ({
        stage: 0,
        isActive: false,
        bullets: 0
      }))
    })),
    currentPlayer: 0,
    lastRoll: null,
    gameLog: [{
      type: 'firstMove',
      player: players[0].username,
      message: `${players[0].username}'s turn! Roll a 1 to start.`
    }]
  };
}

export function processGameAction(room, action, data) {
  // Implementation of game logic
  // This would handle dice rolls, cell upgrades, shooting, etc.
  return room.gameState;
}