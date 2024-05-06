document.addEventListener('DOMContentLoaded', function () {
    // Function to simulate scanning drives
    function scanDrives() {
        // Dummy data for demonstration
        const drives = ['Drive 1', 'Drive 2', 'Drive 3'];
        
        // Clear existing drive list
        const driveList = document.getElementById('drive-list');
        driveList.innerHTML = '';
        
        // Populate drive list with dummy data
        drives.forEach(drive => {
            const li = document.createElement('li');
            li.textContent = drive;
            driveList.appendChild(li);
        });
    }
    
    // Function to handle scan button click
    function handleScanButtonClick() {
        // Get IP address and port from user input
        const ipAddress = prompt('Enter the IP address of the backend server:');
        const port = prompt('Enter the port of the backend server:');
        
        // Check if IP address and port are provided
        if (ipAddress && port) {
            // Attempt to establish WebSocket connection
            const ws = new WebSocket(`ws://${ipAddress}:${port}`);
            
            // Event listener for WebSocket connection open
            ws.addEventListener('open', function (event) {
                // Connection established, simulate scanning drives
                scanDrives();
            });
            
            // Event listener for WebSocket errors
            ws.addEventListener('error', function (event) {
                console.error('WebSocket encountered an error:', event);
            });
            
            // Event listener for WebSocket close
            ws.addEventListener('close', function (event) {
                console.log('WebSocket connection closed.');
            });
        } else {
            console.log('Invalid IP address or port provided.');
        }
    }
    
    // Add event listener to scan button
    const scanButton = document.getElementById('scan-button');
    scanButton.addEventListener('click', handleScanButtonClick);
});

