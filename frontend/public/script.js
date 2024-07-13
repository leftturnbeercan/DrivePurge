document.addEventListener('DOMContentLoaded', () => {
    const ws = new WebSocket('ws://10.0.0.39:8080'); // Update with your server's IP and port if necessary

    ws.onopen = () => {
        console.log("WebSocket connection established with the server");
        updateStatus("Connected to the server.");
    };

    ws.onerror = error => {
        console.log("WebSocket encountered an error: ", error);
        updateStatus("WebSocket error. Check console for details.");
    };

    ws.onmessage = event => {
        console.log("Message received from server: ", event.data);
        const data = JSON.parse(event.data);

        if (data.type === 'scan' && data.drives) {
            updateDriveList(data.drives);
            updateStatus("Scan complete. Drives listed below.");
        } else if (data.type === 'error') {
            alert('Error: ' + data.message);
            updateStatus("Error: " + data.message);
        } else if (data.type === 'success') {
            alert(data.message);
            updateStatus(data.message);
        }
    };

    document.getElementById('scan-button').addEventListener('click', () => {
        ws.send('scan');
        updateStatus("Scanning drives...");
        console.log('Sending message to backend: scan');
    });

    document.getElementById('purge-button').addEventListener('click', () => {
        const driveName = prompt("Enter the drive name to purge (e.g., sda):");
        if (!driveName || !confirm(`Are you sure you want to purge the drive ${driveName}? This action cannot be undone.`)) {
            console.log('Purge cancelled by user.');
            updateStatus('Purge cancelled.');
            return;
        }
        ws.send(`purge ${driveName}`);
        updateStatus(`Purging drive ${driveName}...`);
        console.log(`Sending message to backend to purge: ${driveName}`);
    });

    function updateDriveList(drives) {
        const driveList = document.getElementById('drive-list');
        driveList.innerHTML = ''; // Clear the list
        drives.forEach(drive => {
            const driveInfo = document.createElement('li');
            driveInfo.textContent = `${drive.name}: Total - ${drive.size}, Mounted at - ${drive.mountpoint}`;
            driveList.appendChild(driveInfo);
        });
    }

    function updateStatus(message) {
        const statusElement = document.getElementById('status');
        statusElement.textContent = message;
    }
});
