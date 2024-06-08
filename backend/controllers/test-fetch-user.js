const mongoose = require('mongoose');
const User = require('../models/User'); // Adjust the path based on your project structure

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/usersystem', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');

  // Fetch user by email
  const email = 'TestUser4@gmail.com'; // Replace with the email you want to fetch
  User.findOne({ email }, 'username email publicKey', (err, user) => {
    if (err) {
      console.error('Error fetching user:', err);
      process.exit(1);
    }
    if (!user) {
      console.log('User not found');
      process.exit(0);
    }
    console.log('Fetched user:', user);
    process.exit(0);
  });
})
.catch(err => {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1);
});
