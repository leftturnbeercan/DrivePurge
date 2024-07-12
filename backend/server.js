const WebSocket = require('ws');
const diskusage = require('diskusage');
const path = require('path');

// Define the directories to scan for disk usage
const drivesToCheck = [
    path.parse('/').root, // Root directory
    path.parse('/home').root // Home directory (Linux example)
];

const wss = new WebSocket.Server({ port: 8080 });

wss.on('listening', () => {
    console.log('WebSocket server is listening on port 8080...');
});

wss.on('connection', function connection(ws) {
    console.log('A new client connected!');

    ws.on('message', function incoming(message) {
        console.log('Received message from client:', message);

        if (message === 'scan') {
            scanDrives(ws);
        } else if (message === 'purge') {
            purgeDrives(ws);
        } else {
            ws.send(JSON.stringify({ type: 'error', message: `Unknown command: ${message}` }));
        }
    });
});

function scanDrives(ws) {
    const driveList = drivesToCheck.map(drivePath => {
        try {
            const { total, free } = diskusage.checkSync(drivePath);
            return {
                name: drivePath,
                total,
                used: total - free,
                available: free
            };
        } catch (err) {
            console.error('Error scanning drive:', drivePath, err);
            return null;
        }
    }).filter(drive => drive !== null);

    console.log('Sending drive list:', driveList);
    ws.send(JSON.stringify({ type: 'scan', drives: driveList }));
}

function purgeDrives(ws) {
    ws.send(JSON.stringify({ type: 'purge', message: 'Purging drives is not implemented yet.' }));
}

wss.on('error', (error) => {
    console.error('WebSocket server encountered an error:', error);
});
