document.addEventListener('DOMContentLoaded', function () {
    const ws = new WebSocket('ws://<backend-server-ip>:8080');

    ws.onopen = function() {
        console.log("WebSocket connection established with the server");
    };

    ws.onerror = function(error) {
        console.log("WebSocket encountered an error: ", error);
    };

    ws.onmessage = function(event) {
        console.log("Message received from server: ", event.data);
        const data = JSON.parse(event.data);
        if (data.type === 'scan' && data.drives) {
            updateDriveList(data.drives);
        }
    };

    document.getElementById('scan-button').addEventListener('click', function() {
        console.log('Sending message to backend: scan');
        ws.send('scan');
    });

    function updateDriveList(drives) {
        const driveList = document.getElementById('drive-list');
        driveList.innerHTML = ''; // Clear existing list
        drives.forEach(drive => {
            const driveInfo = document.createElement('li');
            driveInfo.textContent = `${drive.name}: Total - ${drive.size}, Mounted at - ${drive.mountpoint}`;
            driveList.appendChild(driveInfo);
        });
    }
});
