const RandomRequest = require('../models/RandomRequest');
const { broadcastRandomNumber } = require('../webSocket'); // Import the broadcast function
const { checkSpecificRequestFulfillment } = require('../smart-contract/vrfIntegration');

let handling = false;

// Function to check for new random requests
const checkForNewRequests = async () => {
  try {
    const newRequest = await RandomRequest.findOne({ requestId: "18739654719182080837020119342860634833127652913963819565594235542797530137000" });
    if (newRequest && !handling) {
      console.log('New random request found:', newRequest);
      handling = true;
      await handleNewRandomRequest(newRequest);
    }
  } catch (error) {
    console.error('Error checking for new requests:', error);
  }
};

// Function to handle new random requests
const handleNewRandomRequest = async (request) => {
  try {
    let fulfilled = false;
    let randomNumber;

    while (!fulfilled) {
      console.log('Checking fulfillment status for request:', request.requestId);
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds before checking fulfillment status
      const events = await checkSpecificRequestFulfillment(request.requestId);
      if (events.length > 0) {
        fulfilled = true;
        randomNumber = events[0].returnValues.randomWords[0].toString();
        console.log('Random number fulfilled:', randomNumber);

        // Update the request in the database
        await RandomRequest.findByIdAndUpdate(request._id, { randomNumber, fulfilled: true });

        // Broadcast the random number
        broadcastRandomNumber(randomNumber);
        handling = false;
      }
    }
  } catch (error) {
    console.error('Error handling new random request:', error);
  }
};

const startCheckingForNewRequests = () => {
  setInterval(checkForNewRequests, 10000); // Check every 10 seconds
};

module.exports = {
  startCheckingForNewRequests,
};
