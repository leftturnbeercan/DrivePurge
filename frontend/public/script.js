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
            appendLog("Error: " + data.message);
        } else if (data.type === 'success') {
            alert(data.message);
            updateStatus(data.message);
            appendLog(data.message);
        } else if (data.type === 'log') {
            appendLog(data.message);
        }
    };

    document.getElementById('scan-button').addEventListener('click', () => {
        ws.send('scan');
        updateStatus("Scanning drives...");
        appendLog("Scanning drives...");
        console.log('Sending message to backend: scan');
    });

    document.getElementById('purge-button').addEventListener('click', () => {
        const selectedDrives = Array.from(document.querySelectorAll('.drive-checkbox:checked')).map(cb => cb.value);
        if (selectedDrives.length === 0) {
            alert('No drives selected for purging.');
            updateStatus('No drives selected for purging.');
            appendLog('No drives selected for purging.');
            return;
        }
        if (!confirm(`Are you sure you want to purge the following drives: ${selectedDrives.join(', ')}? This action cannot be undone.`)) {
            console.log('Purge cancelled by user.');
            updateStatus('Purge cancelled.');
            appendLog('Purge cancelled.');
            return;
        }
        selectedDrives.forEach(driveName => {
            ws.send(`purge ${driveName}`);
            updateStatus(`Purging drive ${driveName}...`);
            appendLog(`Purging drive ${driveName}...`);
            console.log(`Sending message to backend to purge: ${driveName}`);
        });
    });

    function updateDriveList(drives) {
        const driveList = document.getElementById('drive-list');
        driveList.innerHTML = ''; // Clear the list
        drives.forEach(drive => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <input type="checkbox" class="drive-checkbox" value="${drive.name}" id="drive-${drive.name}">
                <label for="drive-${drive.name}">${drive.name}: Total - ${drive.size}, Mounted at - ${drive.mountpoint}</label>
            `;
            driveList.appendChild(listItem);
        });
    }

    function updateStatus(message) {
        const statusElement = document.getElementById('status');
        statusElement.textContent = message;
    }

    function appendLog(message) {
        const logElement = document.getElementById('log');
        const logEntry = document.createElement('div');
        logEntry.textContent = message;
        logElement.appendChild(logEntry);
        logElement.scrollTop = logElement.scrollHeight; // Auto-scroll to the bottom
    }
});
