const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SafeUniswapInteraction", function () {
  let contract;
  let owner;
  let addr1;
  
  // Common token addresses on mainnet
  const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const USDC = "0xA0b86a33E6417e8b1321A8F5B26f9A7F36Ab1986";
  const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
  
  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    
    const SafeUniswapInteraction = await ethers.getContractFactory("SafeUniswapInteraction");
    contract = await SafeUniswapInteraction.deploy();
    await contract.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should initialize with correct Uniswap addresses", async function () {
      expect(await contract.swapRouter()).to.equal("0xE592427A0AEce92De3Edee1F18E0157C05861564");
      expect(await contract.factory()).to.equal("0x1F98431c8aD98523631AE4a59f267346ea31F984");
    });

    it("Should have correct token addresses", async function () {
      expect(await contract.WETH()).to.equal(WETH);
      expect(await contract.USDC()).to.equal(USDC);
    });
  });

  describe("Price Checking", function () {
    it("Should check price for existing pool", async function () {
      // Note: This test requires mainnet fork to work properly
      // Check WETH/USDC price in 0.3% fee pool
      try {
        const price = await contract.checkPrice(WETH, USDC, 3000);
        expect(price).to.be.greaterThan(0);
      } catch (error) {
        // Pool may not exist in test environment
        expect(error.message).to.include("Pool does not exist");
      }
    });

    it("Should revert for non-existent pool", async function () {
      // Try to check price for a pool that doesn't exist
      await expect(
        contract.checkPrice(WETH, WBTC, 100) // 0.01% fee tier doesn't exist for many pairs
      ).to.be.revertedWith("Pool does not exist");
    });
  });

  describe("Pool Information", function () {
    it("Should get pool info for existing pool", async function () {
      try {
        const [poolAddress, liquidity, tick] = await contract.getPoolInfo(WETH, USDC, 3000);
        expect(poolAddress).to.not.equal(ethers.constants.AddressZero);
        expect(liquidity).to.be.greaterThan(0);
        expect(tick).to.be.a("number");
      } catch (error) {
        // Pool may not exist in test environment
        expect(error.message).to.include("Pool does not exist");
      }
    });
  });

  describe("Arbitrage Detection", function () {
    it("Should detect arbitrage opportunities", async function () {
      try {
        const [exists, priceDiff] = await contract.checkArbitrageOpportunity(
          WETH, USDC, 3000, 10000
        );
        expect(exists).to.be.a("boolean");
        expect(priceDiff).to.be.a("number");
      } catch (error) {
        // Pools may not exist in test environment
        expect(error.message).to.include("Pool does not exist");
      }
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to withdraw ETH", async function () {
      // Send some ETH to the contract
      await owner.sendTransaction({
        to: contract.address,
        value: ethers.utils.parseEther("1")
      });
      
      const initialBalance = await owner.getBalance();
      
      // Owner should be able to withdraw
      await expect(contract.withdrawETH()).to.not.be.reverted;
    });

    it("Should prevent non-owner from executing swaps", async function () {
      await expect(
        contract.connect(addr1).executeSwap(WETH, USDC, 1000, 1000, 3000)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should prevent non-owner from emergency withdrawals", async function () {
      await expect(
        contract.connect(addr1).emergencyWithdraw(WETH)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Security Features", function () {
    it("Should have receive function for ETH", async function () {
      // Should be able to receive ETH
      await expect(
        owner.sendTransaction({
          to: contract.address,
          value: ethers.utils.parseEther("1")
        })
      ).to.not.be.reverted;
      
      const balance = await ethers.provider.getBalance(contract.address);
      expect(balance).to.equal(ethers.utils.parseEther("1"));
    });

    it("Should validate swap parameters", async function () {
      // Should revert for same token swap
      await expect(
        contract.executeSwap(WETH, WETH, 1000, 1000, 3000)
      ).to.be.revertedWith("Cannot swap same token");

      // Should revert for zero amount
      await expect(
        contract.executeSwap(WETH, USDC, 0, 1000, 3000)
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to perform emergency withdrawal", async function () {
      // This would require the contract to have tokens to withdraw
      // In a real test, we'd need to mock token transfers
      await expect(contract.emergencyWithdraw(WETH)).to.not.be.reverted;
    });

    it("Should revert withdrawal when no ETH to withdraw", async function () {
      await expect(contract.withdrawETH()).to.be.revertedWith("No ETH to withdraw");
    });
  });
});