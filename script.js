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
            { id: 2, name: "Crypto Karen", items: [], balance: 2500 },
            { id: 3, name: "Virtual Vince", items: [], balance: 3500 },
            { id: 4, name: "Digital Dave", items: [], balance: 2000 }
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
    
    // Generate initial NPC inventories
    initialData.npcs.forEach(npc => {
        npc.items = generateInventory(npc.balance / 2);
    });
    
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

// User creation function
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

// Item database for trading
const itemsDB = [
    { id: 1, name: "Holocard", basePrice: 50 },
    { id: 2, name: "Virtual Gem", basePrice: 120 },
    { id: 3, name: "Data Crystal", basePrice: 80 },
    { id: 4, name: "Code Fragment", basePrice: 30 },
    { id: 5, name: "AI Core", basePrice: 200 },
    { id: 6, name: "Neon Sword", basePrice: 150 },
    { id: 7, name: "Cyber Helmet", basePrice: 90 },
    { id: 8, name: "Glitch Potion", basePrice: 60 }
];

// Generate random inventory for NPCs
function generateInventory(budget) {
    const inventory = [];
    let remaining = budget;
    
    // Shuffle items
    const shuffledItems = [...itemsDB].sort(() => 0.5 - Math.random());
    
    for (const item of shuffledItems) {
        if (remaining <= 0) break;
        
        // Random chance to include item
        if (Math.random() > 0.7) {
            const maxQty = Math.floor(remaining / item.basePrice);
            if (maxQty > 0) {
                const qty = Math.floor(Math.random() * maxQty) + 1;
                inventory.push({
                    id: item.id,
                    name: item.name,
                    price: Math.floor(item.basePrice * (0.8 + Math.random() * 0.4)), // Random price variation
                    quantity: qty
                });
                remaining -= qty * item.basePrice;
            }
        }
    }
    
    return inventory;
}

// Update crypto prices automatically
function updateCryptoPrices() {
    const gameData = getGameData();
    
    for (let coin in gameData.crypto) {
        // Add new price to history
        const change = (Math.random() * 10 - 5) * (gameData.crypto[coin].price / 20);
        gameData.crypto[coin].price = Math.max(1, gameData.crypto[coin].price + change);
        gameData.crypto[coin].history.push(gameData.crypto[coin].price);
        
        // Keep only last 30 prices
        if (gameData.crypto[coin].history.length > 30) {
            gameData.crypto[coin].history.shift();
        }
    }
    
    saveGameData(gameData);
}

// Trade with NPC
function tradeWithNPC(npcId, itemId, quantity, action) {
    const gameData = getGameData();
    const user = gameData.users[gameData.currentUser];
    const npc = gameData.npcs.find(n => n.id === npcId);
    const npcItem = npc.items.find(i => i.id === itemId);
    const itemInfo = itemsDB.find(i => i.id === itemId);
    
    if (!npcItem || npcItem.quantity < quantity) {
        alert("Not enough items available!");
        return false;
    }
    
    const totalPrice = npcItem.price * quantity;
    
    if (action === 'buy') {
        if (user.balance < totalPrice) {
            alert("Not enough holobucks!");
            return false;
        }
        
        // Execute trade
        user.balance -= totalPrice;
        npc.balance += totalPrice;
        
        if (!user.items) user.items = [];
        const userItem = user.items.find(i => i.id === itemId);
        if (userItem) {
            userItem.quantity += quantity;
        } else {
            user.items.push({ id: itemId, name: itemInfo.name, quantity });
        }
        
        npcItem.quantity -= quantity;
        if (npcItem.quantity <= 0) {
            npc.items = npc.items.filter(i => i.id !== itemId);
        }
    } else {
        // Check if player has the item
        const userItem = user.items?.find(i => i.id === itemId);
        if (!userItem || userItem.quantity < quantity) {
            alert("You don't have enough of this item!");
            return false;
        }
        
        // Check if NPC has enough money
        if (npc.balance < totalPrice) {
            alert("This NPC doesn't have enough holobucks!");
            return false;
        }
        
        // Execute trade
        user.balance += totalPrice;
        npc.balance -= totalPrice;
        
        userItem.quantity -= quantity;
        if (userItem.quantity <= 0) {
            user.items = user.items.filter(i => i.id !== itemId);
        }
        
        const npcExistingItem = npc.items.find(i => i.id === itemId);
        if (npcExistingItem) {
            npcExistingItem.quantity += quantity;
        } else {
            npc.items.push({ id: itemId, name: itemInfo.name, price: npcItem.price, quantity });
        }
    }
    
    saveGameData(gameData);
    return true;
}

// Update crypto prices every 30 seconds
setInterval(updateCryptoPrices, 30000);
