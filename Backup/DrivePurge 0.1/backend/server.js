// Import required modules
const WebSocket = require('ws');

// Add a console.log statement to indicate that the server file is being executed
console.log('Server file is being executed...');

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 }); // Choose a suitable port

// Event listener for WebSocket server initialization
wss.on('listening', () => {
    console.log('WebSocket server is listening on port 8080...');
});

// Event listener for WebSocket connections
wss.on('connection', function connection(ws) {
    console.log('A new client connected!');

    // Event listener for incoming messages from clients
    ws.on('message', function incoming(message) {
        console.log('Received message from client:', message);

        // Echo the message back to the client
        ws.send(`Echo: ${message}`);
    });
});

// Error handling for WebSocket server initialization
wss.on('error', (error) => {
    console.error('WebSocket server encountered an error:', error);
});

// Error handling for WebSocket connections
wss.on('connectionError', (error) => {
    console.error('WebSocket connection error:', error);
});

// Error handling for WebSocket messages
wss.on('messageError', (error) => {
    console.error('WebSocket message error:', error);
});

