document.addEventListener('DOMContentLoaded', function () {
    const ip = prompt("Enter the backend server IP address:", "localhost");
    const port = prompt("Enter the backend server port:", "8080");
    const wsUrl = `ws://${ip}:${port}`;

    let ws = new WebSocket(wsUrl);

    ws.addEventListener('open', function (event) {
        console.log('WebSocket connection established with the server');
    });

    ws.addEventListener('close', function (event) {
        console.log('WebSocket connection closed');
    });

    ws.addEventListener('error', function (event) {
        console.error('WebSocket encountered an error:', event);
    });

    ws.addEventListener('message', function (event) {
        try {
            const data = JSON.parse(event.data);
            console.log('Message received from server:', data);
            if (data.type === 'scan') {
                updateDriveList(data.drives);
            } else if (data.type === 'error') {
                console.error('Error from server:', data.message);
            } else {
                console.log(data.message);
            }
        } catch (e) {
            console.error('Failed to parse message from server as JSON:', event.data);
        }
    });

    function sendMessageToBackend(message) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
        } else {
            console.log('WebSocket connection is not open. Cannot send message.');
        }
    }

    function scanDrives() {
        console.log('Scanning drives...');
        sendMessageToBackend('scan');
    }

    function handleScanButtonClick() {
        scanDrives();
    }

    function handlePurgeButtonClick() {
        console.log('Purging drives...');
        sendMessageToBackend('purge');
    }

    function updateDriveList(drives) {
        const driveList = document.getElementById('drive-list');
        driveList.innerHTML = '';
        drives.forEach(drive => {
            const li = document.createElement('li');
            li.textContent = `${drive.name} - Total: ${drive.total}, Used: ${drive.used}, Available: ${drive.available}`;
            driveList.appendChild(li);
        });
        console.log('Drive list updated:', drives);
    }

    const scanButton = document.getElementById('scan-button');
    scanButton.addEventListener('click', handleScanButtonClick);

    const purgeButton = document.getElementById('purge-button');
    purgeButton.addEventListener('click', handlePurgeButtonClick);

    const driveList = document.getElementById('drive-list');
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                console.log('Drive list has been modified.');
            }
        });
    });

    observer.observe(driveList, { childList: true });
});
