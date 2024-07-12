document.addEventListener('DOMContentLoaded', function () {
    let websocket;

    function connectWebSocket() {
        const ipAddress = prompt("Enter the backend server IP address:");
        const port = prompt("Enter the backend server port:");

        if (!ipAddress || !port) {
            alert('IP address and port are required.');
            return;
        }

        websocket = new WebSocket(`ws://${ipAddress}:${port}`);

        websocket.onopen = function () {
            console.log('WebSocket connection established with the server');
        };

        websocket.onmessage = function (event) {
            console.log('Message received from server:', event.data);
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'scan') {
                    displayDrives(data.drives);
                } else if (data.type === 'purge') {
                    console.log(data.message);
                } else if (data.type === 'error') {
                    console.error('Error from server:', data.message);
                }
            } catch (e) {
                console.error('Failed to parse server message:', e);
            }
        };

        websocket.onerror = function (event) {
            console.error('WebSocket encountered an error:', event);
        };

        websocket.onclose = function () {
            console.log('WebSocket connection closed');
        };
    }

    function displayDrives(drives) {
        const driveList = document.getElementById('drive-list');
        driveList.innerHTML = '';
        drives.forEach(drive => {
            const li = document.createElement('li');
            li.textContent = `${drive.name}: Total - ${drive.total} bytes, Used - ${drive.used} bytes, Available - ${drive.available} bytes`;
            driveList.appendChild(li);
        });
    }

    function sendMessageToBackend(message) {
        if (websocket && websocket.readyState === WebSocket.OPEN) {
            console.log('Sending message to backend:', message);
            websocket.send(message);
        } else {
            console.error('WebSocket connection is not open. Cannot send message.');
        }
    }

    document.getElementById('scan-button').addEventListener('click', function () {
        sendMessageToBackend('scan');
    });

    document.getElementById('purge-button').addEventListener('click', function () {
        sendMessageToBackend('purge');
    });

    connectWebSocket();
});
