const WebSocket = require('ws');
const diskusage = require('diskusage');
const path = require('path');

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
            ws.send(`Unknown command: ${message}`);
        }
    });
});

function scanDrives(ws) {
    const drives = ['/']; // Root directory for Unix-based systems

    Promise.all(drives.map(drive => diskusage.check(drive)))
        .then(results => {
            const driveList = results.map((result, index) => ({
                name: drives[index],
                total: result.total,
                used: result.total - result.free,
                available: result.free
            }));

            ws.send(JSON.stringify({ type: 'scan', drives: driveList }));
        })
        .catch(err => {
            console.error('Error scanning drives:', err);
            ws.send('Error scanning drives');
        });
}

function purgeDrives(ws) {
    // Implement purging logic here
    ws.send('Purging drives is not implemented yet.');
}
