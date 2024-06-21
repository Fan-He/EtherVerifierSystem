// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
    const SubscriptionConsumer = await ethers.getContractFactory("SubscriptionConsumer");
    const subscriptionId = ethers.BigNumber.from("105306430092655140506577265748278780331152699016007072558419937032841393270693"); // Replace with your actual subscription ID
    const contract = await SubscriptionConsumer.deploy(subscriptionId);

    await contract.deployed();

    console.log("SubscriptionConsumer deployed to:", contract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
