// backend/randomNumberMaintainer.js
const { requestRandomNumber, checkRequestFulfillment } = require('../smart-contract/vrfIntegration');
const RandomRequest = require('../models/RandomRequest');

async function maintainRandomNumbersPool() {
  const account = '0x9bB61dcD1A458fFa2d976c78f4a2Aae4f81Da0cc'; // The account to use for requesting random numbers

  while (true) {
    const unusedCount = await RandomRequest.countDocuments({ used: false });
    const pendingCount = await RandomRequest.countDocuments({ fulfilled: false });

    if (unusedCount < 5 && pendingCount === 0) {
      console.log('Requesting new random number...');
      await requestRandomNumber(account);
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds before checking fulfillment status
    }

    await checkRequestFulfillment(); // Check and update fulfillment status of pending requests
    await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 1 minute before checking again
  }
}

maintainRandomNumbersPool().catch(console.error);
