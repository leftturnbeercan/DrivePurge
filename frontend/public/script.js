document.addEventListener('DOMContentLoaded', () => {
    const ws = new WebSocket('ws://10.0.0.39:8080');

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

    const scanButton = document.getElementById('scan-button');
    scanButton.addEventListener('click', () => {
        console.log('Sending message to backend: scan');
        ws.send('scan');
    });

    const purgeButton = document.getElementById('purge-button');
    purgeButton.addEventListener('click', () => {
        const driveName = prompt("Enter the drive name to purge (e.g., sda):");
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
