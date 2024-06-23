const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const locationRoutes = require('./routes/locationRoutes'); 
const randomNumberRoutes = require('./routes/randomNumberRoutes');

dotenv.config();

const app = express();

// Trust the first proxy
app.set('trust proxy', true);

app.use(express.json());
Mongo_uri = 'mongodb://167.99.176.190:27017/usersystem';

mongoose.connect(Mongo_uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5005,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Failed to connect to MongoDB', err));

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/randomNumber', randomNumberRoutes);


app.use((req, res, next) => {
  const realIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(`Request from IP: ${realIp}`);
  next();
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

require('/var/www/EtherVerifierSystem/backend/maintainers/ramdomNumberMaintainer.js');
