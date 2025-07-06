const { ethers } = require("hardhat");
const cron = require("node-cron");

/**
 * @title Safe Uniswap Trading Bot
 * @dev Educational trading bot demonstrating safe contract interaction
 * @notice This is for educational purposes only - use with extreme caution
 */

class SafeUniswapBot {
    constructor(config) {
        this.config = config;
        this.provider = null;
        this.wallet = null;
        this.contract = null;
        this.isRunning = false;
        this.lastPrices = new Map();
        this.opportunities = [];
    }

    /**
     * Initialize the bot with contract connection
     */
    async initialize() {
        console.log("🤖 Initializing Safe Uniswap Bot...");
        
        try {
            // Connect to provider
            this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
            
            // Create wallet
            this.wallet = new ethers.Wallet(this.config.privateKey, this.provider);
            
            // Connect to contract
            const contractFactory = await ethers.getContractFactory("SafeUniswapInteraction");
            this.contract = contractFactory.attach(this.config.contractAddress).connect(this.wallet);
            
            // Verify connection
            const owner = await this.contract.owner();
            console.log(`✅ Connected to contract at ${this.config.contractAddress}`);
            console.log(`📝 Contract owner: ${owner}`);
            console.log(`💰 Bot wallet: ${this.wallet.address}`);
            
            // Check if wallet is contract owner
            if (owner.toLowerCase() !== this.wallet.address.toLowerCase()) {
                console.warn("⚠️  WARNING: Bot wallet is not the contract owner!");
                console.warn("   Trading functions will fail unless you're the owner.");
            }
            
            return true;
        } catch (error) {
            console.error("❌ Bot initialization failed:", error.message);
            return false;
        }
    }

    /**
     * Start the bot monitoring and trading
     */
    async start() {
        if (this.isRunning) {
            console.log("🤖 Bot is already running!");
            return;
        }

        console.log("🚀 Starting Safe Uniswap Bot...");
        this.isRunning = true;

        // Schedule price monitoring every 30 seconds
        cron.schedule("*/30 * * * * *", async () => {
            if (this.isRunning) {
                await this.monitorPrices();
            }
        });

        // Schedule arbitrage detection every 2 minutes
        cron.schedule("*/2 * * * *", async () => {
            if (this.isRunning) {
                await this.detectArbitrageOpportunities();
            }
        });

        // Schedule trade execution every 5 minutes
        cron.schedule("*/5 * * * *", async () => {
            if (this.isRunning) {
                await this.executeTradeIfProfitable();
            }
        });

        console.log("✅ Bot started successfully!");
        console.log("📊 Monitoring prices every 30 seconds");
        console.log("🔍 Checking arbitrage every 2 minutes");
        console.log("💱 Executing trades every 5 minutes");
    }

    /**
     * Stop the bot
     */
    stop() {
        console.log("🛑 Stopping Safe Uniswap Bot...");
        this.isRunning = false;
        console.log("✅ Bot stopped successfully!");
    }

    /**
     * Monitor prices from Uniswap pools
     */
    async monitorPrices() {
        try {
            console.log("📊 Monitoring prices...");
            
            for (const pair of this.config.tradingPairs) {
                try {
                    const price = await this.contract.checkPrice(
                        pair.token0,
                        pair.token1,
                        pair.fee
                    );
                    
                    const priceKey = `${pair.token0}-${pair.token1}-${pair.fee}`;
                    const currentPrice = parseFloat(ethers.formatUnits(price, 18));
                    
                    // Store price history
                    if (!this.lastPrices.has(priceKey)) {
                        this.lastPrices.set(priceKey, []);
                    }
                    
                    const priceHistory = this.lastPrices.get(priceKey);
                    priceHistory.push({
                        price: currentPrice,
                        timestamp: Date.now()
                    });
                    
                    // Keep only last 20 prices
                    if (priceHistory.length > 20) {
                        priceHistory.shift();
                    }
                    
                    // Calculate price change
                    if (priceHistory.length > 1) {
                        const prevPrice = priceHistory[priceHistory.length - 2].price;
                        const priceChange = ((currentPrice - prevPrice) / prevPrice) * 100;
                        
                        console.log(`💹 ${pair.symbol}: ${currentPrice.toFixed(6)} (${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)}%)`);
                        
                        // Alert on significant price movements
                        if (Math.abs(priceChange) > this.config.priceAlertThreshold) {
                            console.log(`🚨 PRICE ALERT: ${pair.symbol} moved ${priceChange.toFixed(2)}%`);
                        }
                    }
                    
                } catch (error) {
                    console.log(`⚠️  Could not get price for ${pair.symbol}:`, error.message);
                }
            }
            
        } catch (error) {
            console.error("❌ Price monitoring failed:", error.message);
        }
    }

    /**
     * Detect arbitrage opportunities between different pools
     */
    async detectArbitrageOpportunities() {
        try {
            console.log("🔍 Detecting arbitrage opportunities...");
            
            for (const pair of this.config.tradingPairs) {
                // Check arbitrage between different fee tiers
                const feeTiers = [500, 3000, 10000]; // 0.05%, 0.3%, 1%
                
                for (let i = 0; i < feeTiers.length; i++) {
                    for (let j = i + 1; j < feeTiers.length; j++) {
                        try {
                            const [exists, priceDiff] = await this.contract.checkArbitrageOpportunity(
                                pair.token0,
                                pair.token1,
                                feeTiers[i],
                                feeTiers[j]
                            );
                            
                            if (exists) {
                                const opportunity = {
                                    pair: pair.symbol,
                                    token0: pair.token0,
                                    token1: pair.token1,
                                    fee1: feeTiers[i],
                                    fee2: feeTiers[j],
                                    priceDiff: parseFloat(priceDiff.toString()) / 100, // Convert to percentage
                                    timestamp: Date.now()
                                };
                                
                                this.opportunities.push(opportunity);
                                
                                console.log(`🎯 ARBITRAGE OPPORTUNITY FOUND!`);
                                console.log(`   Pair: ${opportunity.pair}`);
                                console.log(`   Fee pools: ${opportunity.fee1/100}% vs ${opportunity.fee2/100}%`);
                                console.log(`   Price difference: ${opportunity.priceDiff.toFixed(2)}%`);
                                
                                // Keep only recent opportunities
                                this.opportunities = this.opportunities.filter(
                                    op => Date.now() - op.timestamp < 10 * 60 * 1000 // 10 minutes
                                );
                            }
                            
                        } catch (error) {
                            // Pool might not exist - this is normal
                            if (!error.message.includes("Pool does not exist")) {
                                console.log(`⚠️  Arbitrage check failed for ${pair.symbol}:`, error.message);
                            }
                        }
                    }
                }
            }
            
        } catch (error) {
            console.error("❌ Arbitrage detection failed:", error.message);
        }
    }

    /**
     * Execute trade if profitable opportunity exists
     */
    async executeTradeIfProfitable() {
        try {
            if (this.opportunities.length === 0) {
                console.log("💤 No arbitrage opportunities to execute");
                return;
            }
            
            console.log(`⚡ Evaluating ${this.opportunities.length} opportunities...`);
            
            // Find the most profitable opportunity
            const bestOpportunity = this.opportunities.reduce((best, current) => 
                current.priceDiff > best.priceDiff ? current : best
            );
            
            if (bestOpportunity.priceDiff < this.config.minProfitThreshold) {
                console.log(`📉 Best opportunity (${bestOpportunity.priceDiff.toFixed(2)}%) below threshold (${this.config.minProfitThreshold}%)`);
                return;
            }
            
            console.log(`🎯 Executing trade for ${bestOpportunity.pair}...`);
            console.log(`   Expected profit: ${bestOpportunity.priceDiff.toFixed(2)}%`);
            
            // SAFETY CHECK - Simulate trade first
            if (this.config.simulateOnly) {
                console.log("🧪 SIMULATION MODE - Trade not executed");
                console.log("   Set simulateOnly: false in config to execute real trades");
                return;
            }
            
            // Execute the trade (this is a simplified example)
            await this.executeTrade(bestOpportunity);
            
        } catch (error) {
            console.error("❌ Trade execution failed:", error.message);
        }
    }

    /**
     * Execute a specific trade
     */
    async executeTrade(opportunity) {
        try {
            console.log("💱 Executing trade...");
            
            // This is a simplified example - real arbitrage is more complex
            const amountIn = ethers.parseEther(this.config.tradeAmount.toString());
            const amountOutMin = ethers.parseEther((this.config.tradeAmount * 0.95).toString()); // 5% slippage
            
            const tx = await this.contract.executeSwap(
                opportunity.token0,
                opportunity.token1,
                amountIn,
                amountOutMin,
                opportunity.fee1
            );
            
            console.log(`📝 Trade submitted: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`✅ Trade executed successfully in block ${receipt.blockNumber}`);
            
            // Remove executed opportunity
            this.opportunities = this.opportunities.filter(
                op => op.timestamp !== opportunity.timestamp
            );
            
        } catch (error) {
            console.error("❌ Trade execution failed:", error.message);
        }
    }

    /**
     * Get bot status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            contractAddress: this.config.contractAddress,
            walletAddress: this.wallet?.address,
            opportunities: this.opportunities.length,
            lastPricesCount: this.lastPrices.size
        };
    }

    /**
     * Emergency stop and withdraw
     */
    async emergencyStop() {
        console.log("🚨 EMERGENCY STOP ACTIVATED!");
        this.stop();
        
        try {
            // Withdraw any ETH from contract
            await this.contract.withdrawETH();
            console.log("💰 ETH withdrawn from contract");
            
            // Withdraw any ERC20 tokens (example with WETH)
            await this.contract.emergencyWithdraw(this.config.WETH);
            console.log("💰 WETH withdrawn from contract");
            
        } catch (error) {
            console.error("❌ Emergency withdrawal failed:", error.message);
        }
    }
}

module.exports = SafeUniswapBot;