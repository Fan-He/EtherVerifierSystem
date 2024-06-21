// async function main() {
//     const [deployer] = await ethers.getSigners();
//     console.log("Deploying contracts with the account:", deployer.address);

//     const subscriptionId = 11918; // Replace with your actual subscription ID
//     const VRFv2Consumer = await ethers.getContractFactory("GroupAssignment");
//     const vrfConsumer = await VRFv2Consumer.deploy(subscriptionId);

//     await vrfConsumer.deployed();
//     console.log("GroupAssignment deployed to:", vrfConsumer.address);
// }

// main()
//     .then(() => process.exit(0))
//     .catch((error) => {
//         console.error(error);
//         process.exit(1);
//     });
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const subscriptionId = 11918; // Replace with your subscription ID
  const GroupAssignment = await ethers.getContractFactory("GroupAssignment");
  const groupAssignment = await GroupAssignment.deploy(subscriptionId);

  await groupAssignment.deployed();

  console.log("GroupAssignment deployed to:", groupAssignment.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
