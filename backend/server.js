const WebSocket = require('ws');
const os = require('os');
const { exec } = require('child_process');

// Create a WebSocket server listening on all interfaces
const wss = new WebSocket.Server({ port: 8080, host: '0.0.0.0' });

wss.on('listening', () => {
    console.log('WebSocket server is listening on port 8080...');
});

wss.on('connection', function connection(ws) {
    console.log('A new client connected!');

    ws.on('message', function incoming(message) {
        console.log('Received message from client:', message);

        // Convert message buffer to string
        const parsedMessage = message.toString().trim().toLowerCase();
        console.log('Parsed message:', parsedMessage);

        if (parsedMessage === 'scan') {
            scanDrives(ws);
        } else if (parsedMessage === 'purge') {
            purgeDrives(ws);
        } else {
            ws.send(JSON.stringify({ type: 'error', message: `Unknown command: ${parsedMessage}` }));
        }
    });
});

function scanDrives(ws) {
    if (os.platform() === 'win32') {
        // Implement Windows-specific logic if needed
    } else {
        exec('lsblk -o NAME,SIZE,MOUNTPOINT -J', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing lsblk: ${error}`);
                ws.send(JSON.stringify({ type: 'error', message: 'Error scanning drives' }));
                return;
            }

            console.log('lsblk output:', stdout);

            let result;
            try {
                result = JSON.parse(stdout);
            } catch (err) {
                console.error(`Error parsing lsblk output: ${err}`);
                ws.send(JSON.stringify({ type: 'error', message: 'Error parsing drive information' }));
                return;
            }

            const driveList = [];
            const bootDrive = os.platform() === 'win32' ? 'C:' : '/'; // Default to C: for Windows and / for Unix-based systems

            result.blockdevices.forEach(device => {
                if (!device.mountpoint && device.name !== bootDrive) {
                    const sizeInGB = parseFloat(device.size.replace(/[A-Za-z]/g, '')) * (device.size.includes('G') ? 1 : 0.001);
                    exec(`df --output=source,size,used,avail -B1 /dev/${device.name}`, (dfError, dfStdout, dfStderr) => {
                        if (dfError) {
                            console.error(`Error executing df: ${dfError}`);
                            return;
                        }

                        const dfLines = dfStdout.split('\n');
                        const dfData = dfLines[1].split(/\s+/);
                        const total = (parseInt(dfData[1]) / (1024 ** 3)).toFixed(2); // Convert to GB
                        const used = (parseInt(dfData[2]) / (1024 ** 3)).toFixed(2); // Convert to GB
                        const available = (parseInt(dfData[3]) / (1024 ** 3)).toFixed(2); // Convert to GB

                        driveList.push({
                            name: device.name,
                            total: total,
                            used: used,
                            available: available
                        });

                        // Send the drive list to the client after processing all drives
                        if (driveList.length === result.blockdevices.filter(d => !d.mountpoint && d.name !== bootDrive).length) {
                            console.log('Sending drive list:', driveList);
                            ws.send(JSON.stringify({ type: 'scan', drives: driveList }));
                        }
                    });
                }
            });
        });
    }
}

function purgeDrives(ws) {
    ws.send(JSON.stringify({ type: 'purge', message: 'Purging drives is not implemented yet.' }));
}

wss.on('error', (error) => {
    console.error('WebSocket server encountered an error:', error);
});
