
# Decentralized Computational Resource Verification Network

This repository contains the code for the Decentralized Computational Resource Verification Network. This project allows users to register, login, and send end-to-end encrypted messages. It also supports group formation and leader selection based on a random number generated using Chainlink. The application is built with Node.js, Vue, MongoDB, and Solidity, and it runs on DigitalOcean using Nginx and PM2.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Setup](#setup)
  - [Step 0: System Update and Node.js Installation](#step-0-system-update-and-nodejs-installation)
  - [Step 1: Clone the Repository](#step-1-clone-the-repository)
  - [Step 2: Move to the Target Directory](#step-2-move-to-the-target-directory)
  - [Step 3: Install Docker and Run MongoDB](#step-3-install-docker-and-run-mongodb)
  - [Step 4: Start the Backend with PM2](#step-4-start-the-backend-with-pm2)
  - [Step 5: Setup Nginx](#step-5-setup-nginx)
  - [Step 6: Update Configuration Files](#step-6-update-configuration-files)
  - [Step 7: Update Environment Variables](#step-7-update-environment-variables)
  - [Step 8: Manage Git](#step-8-manage-git)

## Prerequisites

Before you begin, ensure you have the following installed on your server:

- Ubuntu (latest version recommended)
- Node.js v18.20.3
- PM2
- Docker
- Nginx

## Installation

Follow these steps to set up the application on a new server.

### Step 0: System Update and Node.js Installation

Update the system and install necessary packages:

```
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl gnupg2 ca-certificates lsb-release
```

# Install Node.js using NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
export NVM_DIR="$([ -z "\${XDG_CONFIG_HOME-}" ] && printf %s "\${HOME}/.nvm" || printf %s "\${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm --version
nvm install v18.20.3
nvm alias default v18.20.3

# Install PM2 globally
npm install -g pm2
\`\`\`

### Step 1: Clone the Repository

Clone the repository from GitHub:

\`\`\`sh
git clone https://github.com/yourusername/EtherVerifierSystem.git
\`\`\`

### Step 2: Move to the Target Directory

Move the project to \`/var/www\`:

\`\`\`sh
sudo mkdir -p /var/www/EtherVerifierSystem
sudo mv /root/EtherVerifierSystem /var/www/
sudo chown -R www-data:www-data /var/www/EtherVerifierSystem
sudo chmod -R 755 /var/www/EtherVerifierSystem
cd /var/www/EtherVerifierSystem
\`\`\`

### Step 3: Install Docker and Run MongoDB

Install Docker and start MongoDB in a Docker container:

\`\`\`sh
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo docker run -d --name mongodb -p 27017:27017 mongo:4.4.29
\`\`\`

### Step 4: Start the Backend with PM2

Start the backend server using PM2:

\`\`\`sh
pm2 start server.js --name "ether-verifier-backend"
pm2 save
pm2 startup
pm2 status
pm2 logs ether-verifier-backend
\`\`\`

### Step 5: Setup Nginx

Install and configure Nginx:

\`\`\`sh
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/default
\`\`\`

Set the configuration similar to the existing setup. Then, build the frontend and restart Nginx:

\`\`\`sh
npm run build
sudo nginx -t
sudo systemctl restart nginx
\`\`\`

### Step 6: Update Configuration Files

Update \`backend/server.js\`, \`frontend/j/vite.config.js\`, and \`src/main.js\` with the server IP.

### Step 7: Update Environment Variables

Update the \`.env\` files with the server IP for both the frontend and backend.

### Step 8: Manage Git

Ensure local artifacts are not updated in the repository:

\`\`\`sh
git rm --cached backend/.env
git rm --cached frontend/jwtusersystem/.env
git rm -r --cached frontend/jwtusersystem/dist
git rm -r --cached backend/build
git rm -r --cached backend/node_modules
git rm -r --cached frontend/jwtusersystem/node_modules
\`\`\`

## Contributing

If you wish to contribute to this project, please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

For any issues or questions, please open an issue in the GitHub repository.
