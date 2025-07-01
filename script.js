// Initialize game data in localStorage if not exists
if (!localStorage.getItem('holobank')) {
    const initialData = {
        users: {},
        currentUser: null,
        crypto: {
            holocoin: { price: 10, history: [] },
            digidollar: { price: 25, history: [] },
            virtua: { price: 5, history: [] }
        },
        npcs: [
            { id: 1, name: "Trader Joe", items: [], balance: 5000 },
            { id: 2, name: "Crypto Karen", items: [], balance: 2500 }
        ]
    };
    
    // Generate some price history
    for (let coin in initialData.crypto) {
        for (let i = 0; i < 30; i++) {
            initialData.crypto[coin].history.push(
                Math.max(1, initialData.crypto[coin].price + (Math.random() * 10 - 5))
            );
        }
    }
    
    localStorage.setItem('holobank', JSON.stringify(initialData));
}

// Helper function to get game data
function getGameData() {
    return JSON.parse(localStorage.getItem('holobank'));
}

// Helper function to save game data
function saveGameData(data) {
    localStorage.setItem('holobank', JSON.stringify(data));
}

// Example user creation function
function createUser(username) {
    const gameData = getGameData();
    
    if (gameData.users[username]) {
        return false; // User exists
    }
    
    gameData.users[username] = {
        balance: 100,
        crypto: {},
        items: [],
        createdAt: new Date().toISOString()
    };
    
    gameData.currentUser = username;
    saveGameData(gameData);
    return true;
}
