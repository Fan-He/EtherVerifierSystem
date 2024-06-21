// scripts/test.js
const { ethers } = require("hardhat");

async function main() {
    const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/bacfcbcb951e4305867e3b18d3f5da3a');
    const privateKey = '0x2c02bc078bc2f0702f1bbbd1e32d56e3ad8fcc317bc83c1856e34f0528f437a8';
    const wallet = new ethers.Wallet(privateKey, provider);

    const subscriptionConsumerAddress = '0xf0D54f316415de39b49aB01b0D2ae1999C727d0f'; // Replace with deployed contract address
    const SubscriptionConsumer = new ethers.Contract(subscriptionConsumerAddress, [
        "function requestRandomWords() external returns (uint256)",
        "function lastRequestId() external view returns (uint256)",
        "event RequestFulfilled(uint256 indexed requestId, uint256[] randomWords)"
    ], wallet);

    // Request random words
    const tx = await SubscriptionConsumer.requestRandomWords();
    console.log("Request transaction sent:", tx.hash);

    // Wait for the transaction to be confirmed
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt.transactionHash);

    // Get the last request ID
    const lastRequestId = await SubscriptionConsumer.lastRequestId();
    console.log("Last request ID:", lastRequestId.toString());

    // Wait for the request to be fulfilled (this may take several minutes)
    console.log("Waiting for request to be fulfilled...");
    const filter = SubscriptionConsumer.filters.RequestFulfilled(lastRequestId);
    const events = await SubscriptionConsumer.queryFilter(filter, 0, 'latest');
    
    if (events.length > 0) {
        console.log("Request fulfilled with random words:", events[0].args.randomWords);
    } else {
        console.log("Request not fulfilled yet. Please check back later.");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
