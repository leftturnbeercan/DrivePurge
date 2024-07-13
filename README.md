# DrivePurge

DrivePurge is a web-based tool for securely wiping drives. It allows you to scan for connected drives and purge selected drives securely using the `shred` command. This project uses WebSockets to provide real-time updates and logging.

## Features

- Scan for connected drives
- Securely purge selected drives
- Real-time logging of purge process
- Prevents accidental purging of root or system drives

## Requirements

- Node.js
- NPM
- `lsblk` command (Linux)
- `shred` command (Linux)
- Root permissions for purging drives

## Installation

1. Clone the repository:

Create a directory on host maching to clone to
git clone https://github.com/leftturnbeercan/DrivePurge.git
cd DrivePurge

2. Install dependencies for the backend:

cd backend
npm install

3. Install dependencies for the frontend:

cd ../frontend
npm install


## Usage

1. Start the backend server:

cd backend
sudo npm start

2. Start the frontend server: (Make sure the IP and Port for Frontend is corrected in the ../DrivePurge/frontend/public/index.html)

cd ../frontend
npm start

3. Open your web browser and navigate to http://localhost:3000(or the IP and Port you have set the server.js(backend) and/or script.js(frontend) to)

4. Scan for connected drives by clicking the "Scan Drives" button.

5. Select the drives you want to purge and click the "Purge Selected Drives" button. Note: Ensure you have root permissions.


## Development Contributions:

If anyone would like to contribute to this project please do the following:

1.  Fork the repository and create a new branch for your feature or bug fix.

    git checkout -b feature-name


2. Once your changes are ready, push your branch and create a pull request.