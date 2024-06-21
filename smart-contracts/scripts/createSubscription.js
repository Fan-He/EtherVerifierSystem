const { ethers } = require("hardhat");

async function main() {
    const vrfCoordinatorAddress = "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625"; // Sepolia VRF Coordinator address
    const VRFCoordinatorV2ABI = [
        "function createSubscription() public returns (uint64)",
        "event SubscriptionCreated(uint64 indexed subId)"
    ];

    const [deployer] = await ethers.getSigners();
    const vrfCoordinator = new ethers.Contract(vrfCoordinatorAddress, VRFCoordinatorV2ABI, deployer);

    const tx = await vrfCoordinator.createSubscription();
    const receipt = await tx.wait();
    const subscriptionId = receipt.events[0].args.subId.toString();

    console.log("Created subscription ID:", subscriptionId);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
 