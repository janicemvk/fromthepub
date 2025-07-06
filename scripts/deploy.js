const hre = require("hardhat");

async function main() {
  console.log("Deploying SafeUniswapInteraction contract...");
  
  // Get the contract factory
  const SafeUniswapInteraction = await hre.ethers.getContractFactory("SafeUniswapInteraction");
  
  // Deploy the contract
  const contract = await SafeUniswapInteraction.deploy();
  
  // Wait for deployment to complete
  await contract.deployed();
  
  console.log("SafeUniswapInteraction deployed to:", contract.address);
  console.log("Contract owner:", await contract.owner());
  
  // Verify the contract has proper initialization
  const swapRouter = await contract.swapRouter();
  const factory = await contract.factory();
  
  console.log("Swap Router:", swapRouter);
  console.log("Factory:", factory);
  
  console.log("\n⚠️  IMPORTANT SECURITY REMINDERS:");
  console.log("1. This contract is for educational purposes only");
  console.log("2. Do not use with real funds without proper auditing");
  console.log("3. Test thoroughly on testnets before mainnet deployment");
  console.log("4. Consider using multisig for ownership in production");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });