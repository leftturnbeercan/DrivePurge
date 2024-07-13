const WebSocket = require('ws');
const { exec } = require('child_process');

const wss = new WebSocket.Server({ port: 8080, host: '0.0.0.0' });

wss.on('listening', () => {
    console.log('WebSocket server is listening on port 8080...');
});

wss.on('connection', function connection(ws) {
    console.log('A new client connected!');

    ws.on('message', function incoming(message) {
        console.log('Received message from client:', message);

        //Parsoning JSON format
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
                purgeDrive(command.driveName, ws);
                break;
            default:
                ws.send(JSON.stringify({ type: 'error', message: `Unknown command: ${command.type}` }));
        }
    });
});

function scanDrives(ws) {
    // Simulated scan function (previously defined)
    console.log('Scanning drives...');
    ws.send(JSON.stringify({ type: 'scan', drives: [{ name: 'sda', total: '500GB', used: '200GB', available: '300GB' }] }));
}

function purgeDrive(driveName, ws) {
    if (!driveName) {
        ws.send(JSON.stringify({ type: 'error', message: 'Drive name is required for purging' }));
        return;
    }

    const cmd = `shred -v -n 1 /dev/${driveName}`;
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error purging drive ${driveName}:`, error);
            ws.send(JSON.stringify({ type: 'error', message: `Error purging drive ${driveName}: ${error.message}` }));
            return;
        }
        console.log(`Drive ${driveName} purged successfully.`);
        ws.send(JSON.stringify({ type: 'success', message: `Drive ${driveName} purged successfully.` }));
    });
}

wss.on('error', (error) => {
    console.error('WebSocket server encountered an error:', error);
});
