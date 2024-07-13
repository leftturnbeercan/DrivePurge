const WebSocket = require('ws');
const { exec } = require('child_process');

const wss = new WebSocket.Server({ port: 8080, host: '0.0.0.0' });

wss.on('listening', () => {
    console.log('WebSocket server is listening on port 8080...');
});

wss.on('connection', function connection(ws) {
    console.log('A new client connected!');

    ws.on('message', function incoming(message) {
        const command = message.toString().trim();
        console.log('Received command:', command);

        if (command === 'scan') {
            scanDrives(ws);
        } else {
            ws.send(JSON.stringify({ type: 'error', message: 'Unknown command' }));
        }
    });
});

function scanDrives(ws) {
    exec('lsblk -J -o NAME,SIZE,MOUNTPOINT', (error, stdout) => {
        if (error) {
            console.error('Error executing lsblk:', error);
            ws.send(JSON.stringify({ type: 'error', message: 'Failed to scan drives' }));
            return;
        }

        console.log('lsblk output:', stdout);
        const output = JSON.parse(stdout);
        const drives = output.blockdevices.map(drive => {
            const isRootOrSystem = (drive.mountpoint === '/') ||
                                   (drive.children && drive.children.some(child => child.mountpoint === '/'));
            if (isRootOrSystem) {
                return null;
            }
            return {
                name: drive.name,
                size: drive.size,
                mountpoint: drive.mountpoint || 'Not mounted'
            };
        }).filter(drive => drive !== null);

        console.log('Sending drive list:', drives);
        ws.send(JSON.stringify({ type: 'scan', drives }));
    });
}

console.log('WebSocket server running.');
