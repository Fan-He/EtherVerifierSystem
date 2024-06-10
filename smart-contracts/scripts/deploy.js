const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    const chainlinkSubscriptionId = 1;  // Replace with your actual Chainlink subscription ID

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    const GroupAssignment = await ethers.getContractFactory("GroupAssignment");
    const groupAssignment = await GroupAssignment.deploy(chainlinkSubscriptionId);

    await groupAssignment.deployed();

    console.log("GroupAssignment deployed to:", groupAssignment.address);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
