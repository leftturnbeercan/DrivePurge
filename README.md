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

```sh
git clone https://github.com/leftturnbeercan/DrivePurge.git
cd DrivePurge
