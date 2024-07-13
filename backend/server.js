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
        } else if (command.startsWith('purge')) {
            const parts = command.split(' ');
            if (parts.length === 2) {
                const driveName = parts[1];
                if (isValidDrive(driveName)) {
                    purgeDrive(ws, driveName);
                } else {
                    ws.send(JSON.stringify({ type: 'error', message: 'Invalid or dangerous purge command' }));
                }
            } else {
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid purge command format' }));
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
        const drives = output.blockdevices
            .filter(drive => !isRootOrSystemDrive(drive))
            .map(drive => ({
                name: drive.name,
                size: drive.size,
                mountpoint: drive.mountpoint || 'Not mounted'
            }));

        console.log('Sending drive list:', drives);
        ws.send(JSON.stringify({ type: 'scan', drives }));
    });
}

function isRootOrSystemDrive(drive) {
    return drive.mountpoint === '/' || (drive.children && drive.children.some(child => child.mountpoint === '/'));
}

function isValidDrive(driveName) {
    // Add logic to validate if the drive is valid and not a system-critical drive
    return driveName !== 'sda'; // Replace with your actual system drive names to exclude
}

function purgeDrive(ws, driveName) {
    const command = `sudo shred -v -n 3 -z /dev/${driveName}`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            ws.send(JSON.stringify({ type: 'error', message: `Error purging drive ${driveName}: ${stderr}` }));
            console.error('Error purging drive:', stderr);
            return;
        }
        ws.send(JSON.stringify({ type: 'success', message: `Drive ${driveName} purged successfully.` }));
        console.log(`Purge successful: ${stdout}`);
    });
}

console.log('WebSocket server running.');
