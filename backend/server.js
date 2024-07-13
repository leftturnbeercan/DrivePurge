const WebSocket = require('ws');
const { exec } = require('child_process');

// Start WebSocket Server on port 8080 and listen on all interfaces
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
                // Placeholder for purging logic
                break;
            default:
                ws.send(JSON.stringify({ type: 'error', message: `Unknown command: ${command.type}` }));
        }
    });
});

function scanDrives(ws) {
    // Using lsblk to get disk details in JSON format
    exec("lsblk -J -o NAME,SIZE,MOUNTPOINT", (error, stdout, stderr) => {
        if (error) {
            console.error('Error fetching disk info:', error);
            ws.send(JSON.stringify({ type: 'error', message: 'Failed to get disk info' }));
            return;
        }
        if (stderr) {
            console.error('Error in lsblk:', stderr);
            ws.send(JSON.stringify({ type: 'error', message: stderr }));
            return;
        }

        const lsblkOutput = JSON.parse(stdout);
        const drives = lsblkOutput.blockdevices.map(device => {
            // Filter to include only main disks and exclude partitions
            if (!device.children && device.mountpoint !== '/') {
                return {
                    name: device.name,
                    total: device.size,
                    mountpoint: device.mountpoint || "Not mounted"
                };
            }
        }).filter(Boolean); // Remove undefined entries

        ws.send(JSON.stringify({ type: 'scan', drives }));
    });
}

wss.on('error', (error) => {
    console.error('WebSocket encountered an error:', error);
});
