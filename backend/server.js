const WebSocket = require('ws');
const { exec } = require('child_process');

const wss = new WebSocket.Server({ port: 8080, host: '0.0.0.0' });

wss.on('listening', () => {
    console.log('WebSocket server is listening on port 8080...');
});

wss.on('connection', function connection(ws) {
    console.log('A new client connected!');

    ws.on('message', function incoming(message) {
        console.log('Received message from client:', message.toString());
        const command = message.toString().trim();

        switch(command) {
            case 'scan':
                scanDrives(ws);
                break;
            default:
                if (command.startsWith('purge ')) {
                    purgeDrive(ws, command.split(' ')[1]);
                } else {
                    ws.send(JSON.stringify({ type: 'error', message: 'Unknown command' }));
                }
                break;
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
        const output = JSON.parse(stdout);
        const drives = output.blockdevices.map((drive) => {
            return {
                name: drive.name,
                size: drive.size,
                mountpoint: (drive.children || []).map(child => child.mountpoint).filter(mp => mp).join(', ') || 'Not mounted'
            };
        }).filter(drive => drive.mountpoint !== '/');

        console.log('Sending drive list:', drives);
        ws.send(JSON.stringify({ type: 'scan', drives }));
    });
}

function purgeDrive(ws, driveName) {
    // Ensure the command only affects allowed drives
    if (!/^[a-zA-Z0-9]+$/.test(driveName)) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid drive name' }));
        return;
    }

    const command = `sudo shred -v -n 1 /dev/${driveName}`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Error purging drive:', error);
            ws.send(JSON.stringify({ type: 'error', message: `Error purging drive ${driveName}: ${stderr}` }));
            return;
        }
        ws.send(JSON.stringify({ type: 'success', message: `Drive ${driveName} purged successfully.` }));
    });
}

console.log('WebSocket server running.');
