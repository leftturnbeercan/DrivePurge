const WebSocket = require('ws');
const os = require('os');
const diskusage = require('diskusage');

const wss = new WebSocket.Server({ port: 8080, host: '0.0.0.0' });

wss.on('listening', () => {
    console.log('WebSocket server is listening on all interfaces on port 8080...');
});

wss.on('connection', function connection(ws) {
    console.log('A new client connected!');
    
    ws.on('message', function incoming(message) {
        console.log('Received message from client:', message);
        
        let command;
        try {
            command = JSON.parse(message);
        } catch (e) {
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid command format' }));
            return;
        }

        switch (command.type) {
            case 'scan':
                scanDrives(ws);
                break;
            case 'purge':
                // Purging logic will go here
                break;
            default:
                ws.send(JSON.stringify({ type: 'error', message: `Unknown command: ${command.type}` }));
        }
    });
});

function scanDrives(ws) {
    const path = os.platform() === 'win32' ? 'c:' : '/';
    diskusage.check(path, (err, info) => {
        if (err) {
            console.error('Error getting disk info:', err);
            ws.send(JSON.stringify({ type: 'error', message: 'Failed to get disk info' }));
            return;
        }
        const drives = [{
            name: 'sda',  // Adjust as needed
            total: (info.total / 1e9).toFixed(2) + 'GB',
            used: ((info.total - info.available) / 1e9).toFixed(2) + 'GB',
            available: (info.available / 1e9).toFixed(2) + 'GB'
        }];
        ws.send(JSON.stringify({ type: 'scan', drives: drives }));
    });
}

wss.on('error', (error) => {
    console.error('WebSocket encountered an error:', error);
});
