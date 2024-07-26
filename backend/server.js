const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const locationRoutes = require('./routes/locationRoutes');
const randomNumberRoutes = require('./routes/randomNumberRoutes');
const groupRoutes = require('./routes/groupRoutes');
const { initializeWebSocketServer } = require('./webSocket'); // Import the WebSocket module
const { startCheckingForNewRequests } = require('./controllers/randomRequestController');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Trust the first proxy
app.set('trust proxy', true);

app.use(express.json());

const Mongo_uri = `mongodb://${process.env.DB_SERVER_IP}:27017/usersystem`;

mongoose.connect(Mongo_uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // Increase timeout to 10 seconds
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Failed to connect to MongoDB', err));

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/randomNumber', randomNumberRoutes);
app.use('/api/groups', groupRoutes);
// app.get('/', (req, res) => {
//   res.send('Hello from the backend server!');
// });
// // app.use('/access', (req, res) => {
// //   res.send('Gain access from backend server');
// // });
// app.get('/health', (req, res) => {
//   res.status(200).send('OK');
// });

// Serve static files from the frontend 'dist' directory
const frontendDistPath = path.join(__dirname, '../frontend/jwtusersystem/dist');
app.use(express.static(frontendDistPath));

// All other routes should serve the frontend application
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});


app.use((req, res, next) => {
  const realIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(`Request from IP: ${realIp}`);
  next();
});

const PORT = process.env.PORT || 5005;
const HOST = '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});



// Initialize WebSocket server
initializeWebSocketServer(server);

startCheckingForNewRequests();

module.exports = app; // Export only the app
