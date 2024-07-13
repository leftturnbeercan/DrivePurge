document.addEventListener('DOMContentLoaded', function() {
    const ws = new WebSocket('ws://localhost:8080'); // Adjust the address as needed

    ws.onopen = function() {
        console.log("WebSocket connection established.");
    };

    ws.onerror = function(error) {
        console.log("WebSocket encountered an error: ", error);
        alert("Failed to connect to WebSocket server.");
    };

    ws.onmessage = function(event) {
        console.log("Message from server: ", event.data);
        const data = JSON.parse(event.data);
        if (data.type === 'scan') {
            updateDriveList(data.drives);
        } else if (data.type === 'error') {
            alert(`Error: ${data.message}`);
        } else if (data.type === 'success') {
            alert(data.message);
        }
    };

    document.getElementById('scan-button').addEventListener('click', function() {
        ws.send(JSON.stringify({ type: 'scan' }));
    });

    document.getElementById('purge-button').addEventListener('click', function() {
        const driveName = prompt("Enter the drive name to purge (e.g., sda):");
        if (driveName && confirm("Are you sure you want to securely purge this drive? This action cannot be undone.")) {
            ws.send(JSON.stringify({ type: 'purge', driveName }));
        }
    });

    function updateDriveList(drives) {
        const driveList = document.getElementById('drive-list');
        driveList.innerHTML = '';
        drives.forEach(drive => {
            const li = document.createElement('li');
            li.textContent = `${drive.name}: Total - ${drive.total}, Used - ${drive.used}, Available - ${drive.available}`;
            driveList.appendChild(li);
        });
    }
});
