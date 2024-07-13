const WebSocket = require('ws');
const { exec } = require('child_process');

const wss = new WebSocket.Server({ port: 8080, host: '0.0.0.0' });
let validDrives = [];

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
        validDrives = output.blockdevices
            .filter(drive => !isRootOrSystemDrive(drive))
            .map(drive => ({
                name: drive.name,
                size: drive.size,
                mountpoint: drive.mountpoint || 'Not mounted'
            }));

        console.log('Sending drive list:', validDrives);
        ws.send(JSON.stringify({ type: 'scan', drives: validDrives }));
    });
}

function isRootOrSystemDrive(drive) {
    return drive.mountpoint === '/' || (drive.children && drive.children.some(child => child.mountpoint === '/'));
}

function isValidDrive(driveName) {
    return validDrives.some(drive => drive.name === driveName);
}

function purgeDrive(ws, driveName) {
    const command = `sudo shred -v -n 3 -z /dev/${driveName}`;
    const purgeProcess = exec(command);

    purgeProcess.stdout.on('data', data => {
        ws.send(JSON.stringify({ type: 'log', message: data.toString() }));
    });

    purgeProcess.stderr.on('data', data => {
        ws.send(JSON.stringify({ type: 'log', message: data.toString() }));
    });

    purgeProcess.on('close', code => {
        if (code === 0) {
            ws.send(JSON.stringify({ type: 'success', message: `Drive ${driveName} purged successfully.` }));
        } else {
            ws.send(JSON.stringify({ type: 'error', message: `Error purging drive ${driveName}` }));
        }
    });
}

console.log('WebSocket server running.');
