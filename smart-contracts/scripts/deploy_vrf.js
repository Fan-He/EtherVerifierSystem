// // scripts/deploy_vrf.js
// const { ethers } = require("hardhat");

// async function main() {
//   const SubscriptionConsumer = await ethers.getContractFactory("SubscriptionConsumer");
//   const subscriptionId = ethers.BigNumber.from("105306430092655140506577265748278780331152699016007072558419937032841393270693"); // subscription ID
//   const contract = await SubscriptionConsumer.deploy(subscriptionId);

//   await contract.deployed();

//   console.log("SubscriptionConsumer deployed to:", contract.address);
// }

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });

async function main() {
  const [deployer] = await ethers.getSigners();
  const subscriptionId = ethers.BigNumber.from("98397753743196572711658493329126655574458932542096793052611003949351240913023"); // subscription ID
  
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Account balance:", balance.toString());

  const SubscriptionConsumer = await ethers.getContractFactory("SubscriptionConsumer");
  const subscriptionConsumer = await SubscriptionConsumer.deploy(subscriptionId);

  console.log("Contract deployed to address:", subscriptionConsumer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });