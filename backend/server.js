const WebSocket = require('ws');
const diskusage = require('diskusage');
const os = require('os');
const path = require('path');

// Create a WebSocket server listening on all interfaces
const wss = new WebSocket.Server({ port: 8080, host: '0.0.0.0' });

wss.on('listening', () => {
    console.log('WebSocket server is listening on port 8080...');
});

wss.on('connection', function connection(ws) {
    console.log('A new client connected!');

    ws.on('message', function incoming(message) {
        console.log('Received message from client:', message);

        // Convert message buffer to string
        const parsedMessage = message.toString().trim().toLowerCase();
        console.log('Parsed message:', parsedMessage);

        if (parsedMessage === 'scan') {
            scanDrives(ws);
        } else if (parsedMessage === 'purge') {
            purgeDrives(ws);
        } else {
            ws.send(JSON.stringify({ type: 'error', message: `Unknown command: ${parsedMessage}` }));
        }
    });
});

function scanDrives(ws) {
    const drives = os.platform() === 'win32' ? ['C:'] : ['/']; // Adjust for more drives if needed
    const driveList = [];

    drives.forEach(drive => {
        try {
            const info = diskusage.checkSync(drive);
            driveList.push({
                name: drive,
                total: (info.total / (1024 ** 3)).toFixed(2), // Convert to GB
                used: ((info.total - info.free) / (1024 ** 3)).toFixed(2), // Convert to GB
                available: (info.free / (1024 ** 3)).toFixed(2) // Convert to GB
            });
        } catch (err) {
            console.error(`Error getting disk usage for drive ${drive}:`, err);
        }
    });

    console.log('Sending drive list:', driveList);
    ws.send(JSON.stringify({ type: 'scan', drives: driveList }));
}

function purgeDrives(ws) {
    ws.send(JSON.stringify({ type: 'purge', message: 'Purging drives is not implemented yet.' }));
}

wss.on('error', (error) => {
    console.error('WebSocket server encountered an error:', error);
});
