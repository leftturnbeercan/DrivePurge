const WebSocket = require('ws');
const diskinfo = require('diskinfo');

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
    diskinfo.getDrives((err, drives) => {
        if (err) {
            console.error('Error scanning drives:', err);
            ws.send(JSON.stringify({ type: 'error', message: 'Error scanning drives' }));
            return;
        }

        const driveList = drives.map(drive => ({
            name: drive.mounted,
            total: drive.blocks,
            used: drive.used,
            available: drive.available
        }));

        console.log('Sending drive list:', driveList);
        ws.send(JSON.stringify({ type: 'scan', drives: driveList }));
    });
}

function purgeDrives(ws) {
    ws.send(JSON.stringify({ type: 'purge', message: 'Purging drives is not implemented yet.' }));
}

wss.on('error', (error) => {
    console.error('WebSocket server encountered an error:', error);
});
