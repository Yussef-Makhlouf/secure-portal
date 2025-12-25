# Deploying to Hostinger

This guide covers how to deploy your Secure Portal to Hostinger.

## Option A: Hostinger VPS (Recommended)

Requires a VPS plan (Ubuntu recommended). The most robust option.

### 1. Build Globally
Run this command on your local machine to create a standalone build:
```bash
npm run build
```
This creates a `.next/standalone` folder.

### 2. Prepare for Upload
Copy your `public` and `.next/static` folders to the standalone folder to include assets:
```bash
# Windows PowerShell
Copy-Item -Recurse public .next/standalone/public
Copy-Item -Recurse .next/static .next/standalone/.next/static
```

### 3. Upload to VPS
Use SFTP (FileZilla) or `scp` to upload the contents of `.next/standalone` to your server (e.g., `/var/www/secure-portal`).

### 4. Setup on Server
SSH into your VPS and install Node.js + PM2:
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 process manager
sudo npm install -g pm2
```

### 5. Start Application
```bash
cd /var/www/secure-portal
# Set your MongoDB URI
export MONGODB_URI="mongodb+srv://technova-apps:Technova21134@cluster0.dznmohn.mongodb.net/secure-portal?retryWrites=true&w=majority"
export PORT=3000

# Start with PM2
pm2 start server.js --name secure-portal
pm2 save
pm2 startup
```

---

## Option B: Hostinger Shared/Cloud Hosting (Node.js)

If you have a customized Shared Hosting plan that supports Node.js.

1. **Log in to hPanel** and find "Node.js" section.
2. **Create New Application**:
   - Node.js Version: 18 or 20 (Recommended)
   - Application Mode: Production
   - Application Root: `public_html/secure-portal` (or similar)
   - Startup File: `server.js` (we will use the standalone server)
3. **Upload Files**:
   - Run `npm run build` locally first.
   - Follow "Prepare for Upload" step from Option A.
   - Compress the contents of `.next/standalone` into `deploy.zip`.
   - Upload `deploy.zip` to the Application Root directory using File Manager.
   - Extract the zip file.
4. **Environment Variables**:
   - In hPanel Node.js settings, add environment variable:
     - Key: `MONGODB_URI`
     - Value: `mongodb+srv://technova-apps:Technova21134@cluster0.dznmohn.mongodb.net/secure-portal?retryWrites=true&w=majority`
5. **Start App**:
   - Click "Install NPM Packages" (if `package.json` was uploaded).
   - Click "Start Application".

---

## Troubleshooting

- **Google Fonts Error**: We disabled font optimization to prevent build errors.
- **Port In Use**: If port 3000 is taken, change the PORT environment variable.
- **Database Connection**: Ensure your Hostinger IP is whitelisted in MongoDB Atlas Network Access (set to `0.0.0.0/0` to allow all IPs if static IP is not possible).
