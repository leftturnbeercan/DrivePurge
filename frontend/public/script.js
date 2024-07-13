document.addEventListener('DOMContentLoaded', () => {
    const ws = new WebSocket('ws://10.0.0.39:8080'); // Adjust as needed

    ws.onopen = () => console.log("WebSocket connection established with the server");
    ws.onerror = error => console.log("WebSocket encountered an error:", error);
    ws.onmessage = event => {
        console.log("Message received from server:", event.data);
        const data = JSON.parse(event.data);
        if (data.type === 'scan' && data.drives) {
            updateDriveList(data.drives);
        } else if (data.type === 'error') {
            console.error('Error from server:', data.message);
        }
    };

    document.getElementById('scan-button').addEventListener('click', () => {
        console.log('Sending message to backend: scan');
        ws.send('scan');
    });

    document.getElementById('purge-button').addEventListener('click', () => {
        const driveName = prompt("Enter the drive name to purge (e.g., sda):");
        if (!driveName || !confirm(`Are you sure you want to purge the drive ${driveName}? This action cannot be undone.`)) {
            console.log('Purge cancelled by user.');
            return;
        }
        console.log(`Sending message to backend to purge: ${driveName}`);
        ws.send(`purge ${driveName}`);
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
});
