document.addEventListener('DOMContentLoaded', function () {
    let websocket;

    function sendMessageToBackend(message) {
        if (websocket && websocket.readyState === WebSocket.OPEN) {
            console.log('Sending message to backend:', message);
            websocket.send(message);
        } else {
            console.error('WebSocket connection is not open. Cannot send message.');
        }
    }

    function handleScanButtonClick() {
        const backendIp = prompt("Enter the backend server IP address (default: localhost):", "localhost");
        const backendPort = prompt("Enter the backend server port (default: 8080):", "8080");

        if (!backendIp || !backendPort) {
            alert('Backend IP and port must be specified.');
            return;
        }

        const websocketUrl = `ws://${backendIp}:${backendPort}/`;
        websocket = new WebSocket(websocketUrl);

        websocket.onopen = function () {
            console.log('WebSocket connection established with the server');
            sendMessageToBackend('scan');
        };

        websocket.onmessage = function (event) {
            console.log('Message received from server:', event.data);

            try {
                const message = JSON.parse(event.data);

                if (message.type === 'scan') {
                    const driveList = document.getElementById('drive-list');
                    driveList.innerHTML = '';

                    message.drives.forEach(drive => {
                        const li = document.createElement('li');
                        li.textContent = `${drive.name}: Total - ${drive.total} GB, Used - ${drive.used} GB, Available - ${drive.available} GB`;
                        driveList.appendChild(li);
                    });
                } else if (message.type === 'error') {
                    console.error('Error from server:', message.message);
                }
            } catch (e) {
                console.error('Error parsing message from server:', e);
            }
        };

        websocket.onerror = function (event) {
            console.error('WebSocket encountered an error:', event);
        };

        websocket.onclose = function () {
            console.log('WebSocket connection closed');
        };
    }

    function handlePurgeButtonClick() {
        sendMessageToBackend('purge');
    }

    const scanButton = document.getElementById('scan-button');
    scanButton.addEventListener('click', handleScanButtonClick);

    const purgeButton = document.getElementById('purge-button');
    purgeButton.addEventListener('click', handlePurgeButtonClick);
});
