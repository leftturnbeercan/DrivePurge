document.addEventListener('DOMContentLoaded', () => {
    const ws = new WebSocket('ws://10.0.0.39:8080'); // Update with your server's IP and port if necessary

    ws.onopen = () => console.log("WebSocket connection established with the server");
    ws.onerror = error => console.log("WebSocket encountered an error: ", error);
    ws.onmessage = event => {
        console.log("Message received from server: ", event.data);
        const data = JSON.parse(event.data);
        if (data.type === 'scan' && data.drives) {
            updateDriveList(data.drives);
        } else if (data.type === 'error') {
            alert('Error: ' + data.message);
        } else if (data.type === 'success') {
            alert(data.message);
        }
    };

    document.getElementById('scan-button').addEventListener('click', () => {
        ws.send('scan');
        console.log('Sending message to backend: scan');
    });

    document.getElementById('purge-button').addEventListener('click', () => {
        const driveName = prompt("Enter the drive name to purge (e.g., sda):");
        if (!driveName || !confirm(`Are you sure you want to purge the drive ${driveName}? This action cannot be undone.`)) {
            console.log('Purge cancelled by user.');
            return;
        }
        ws.send(`purge ${driveName}`);
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
});
