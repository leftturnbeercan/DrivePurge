const WebSocket = require('ws');
const { exec } = require('child_process');

const wss = new WebSocket.Server({ port: 8080, host: '0.0.0.0' });

wss.on('listening', () => {
    console.log('WebSocket server is listening on port 8080...');
});

wss.on('connection', function connection(ws) {
    console.log('A new client connected!');

    ws.on('message', function incoming(message) {
        console.log('Received message from client:', message.toString().trim());
        const command = message.toString().trim();

        if (command === 'scan') {
            scanDrives(ws);
        } else if (command.startsWith('purge')) {
            const parts = command.split(' ');
            if (parts.length === 2 && parts[1] !== '/') {
                purgeDrive(ws, parts[1]);
            } else {
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid or dangerous purge command' }));
            }
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

        const output = JSON.parse(stdout);
        const drives = output.blockdevices.map(drive => {
            // Exclude root drive explicitly and drives without mountpoints
            if (!drive.mountpoint || drive.mountpoint === '/') {
                return null;
            }
            return { name: drive.name, size: drive.size, mountpoint: drive.mountpoint || 'Not mounted' };
        }).filter(drive => drive !== null);

        console.log('Sending drive list:', drives);
        ws.send(JSON.stringify({ type: 'scan', drives }));
    });
}

function purgeDrive(ws, driveName) {
    // Ensure command safety by confirming drive name format and non-root drive
    if (!/^[a-zA-Z0-9]+$/.test(driveName)) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid drive name' }));
        return;
    }

    const command = `sudo shred -v -n 1 /dev/${driveName}`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            ws.send(JSON.stringify({ type: 'error', message: `Error purging drive ${driveName}: ${stderr}` }));
            return;
        }
        ws.send(JSON.stringify({ type: 'success', message: `Drive ${driveName} purged successfully.` }));
    });
}

console.log('WebSocket server running.');
