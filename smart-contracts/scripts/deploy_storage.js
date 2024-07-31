async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    const GroupHashStorage = await ethers.getContractFactory("GroupHashStorage");
    const groupHashStorage = await GroupHashStorage.deploy();
  
    console.log("GroupHashStorage contract deployed to:", groupHashStorage.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  