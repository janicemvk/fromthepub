#!/usr/bin/env node

const SafeUniswapBot = require('./bot');
const { config, validateConfig } = require('./config');

/**
 * @title Safe Uniswap Trading Bot Runner
 * @dev Main script to run the educational trading bot
 * @notice IMPORTANT: This is for educational purposes only!
 */

class BotRunner {
    constructor() {
        this.bot = null;
        this.isShuttingDown = false;
    }

    async start() {
        console.log("🚀 Starting Safe Uniswap Trading Bot...");
        console.log("📚 This is an educational project - use with extreme caution!");
        console.log("=" .repeat(60));

        try {
            // Validate configuration
            const errors = validateConfig(config);
            if (errors.length > 0) {
                console.error("❌ Configuration errors:");
                errors.forEach(error => console.error(`   - ${error}`));
                console.log("\n💡 Please check your configuration in config.js");
                process.exit(1);
            }

            // Show configuration status
            this.showConfiguration();

            // Create bot instance
            this.bot = new SafeUniswapBot(config);

            // Initialize bot
            const initialized = await this.bot.initialize();
            if (!initialized) {
                console.error("❌ Bot initialization failed");
                process.exit(1);
            }

            // Setup graceful shutdown
            this.setupGracefulShutdown();

            // Start the bot
            await this.bot.start();

            // Show status every 10 minutes
            setInterval(() => {
                this.showStatus();
            }, 10 * 60 * 1000);

            console.log("\n🎯 Bot is running! Press Ctrl+C to stop.");
            console.log("📊 Check the logs for trading activity.");

        } catch (error) {
            console.error("❌ Failed to start bot:", error.message);
            process.exit(1);
        }
    }

    showConfiguration() {
        console.log("⚙️  Configuration:");
        console.log(`   Network: ${config.testnet ? 'Testnet' : 'Mainnet'}`);
        console.log(`   Simulation Mode: ${config.simulateOnly ? 'ON' : 'OFF'}`);
        console.log(`   Trade Amount: ${config.tradeAmount} ETH`);
        console.log(`   Min Profit Threshold: ${config.minProfitThreshold}%`);
        console.log(`   Trading Pairs: ${config.tradingPairs.length}`);
        
        if (config.simulateOnly) {
            console.log("🧪 SIMULATION MODE ENABLED - No real trades will be executed");
        } else {
            console.log("⚠️  REAL TRADING MODE - Actual trades will be executed!");
        }
        
        console.log("-".repeat(60));
    }

    showStatus() {
        if (this.bot) {
            const status = this.bot.getStatus();
            console.log("\n📊 Bot Status:");
            console.log(`   Running: ${status.isRunning ? '✅' : '❌'}`);
            console.log(`   Wallet: ${status.walletAddress}`);
            console.log(`   Opportunities: ${status.opportunities}`);
            console.log(`   Price Data Points: ${status.lastPricesCount}`);
            console.log(`   Uptime: ${this.getUptime()}`);
        }
    }

    getUptime() {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            if (this.isShuttingDown) {
                console.log("\n🔄 Shutdown in progress...");
                return;
            }

            this.isShuttingDown = true;
            console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);

            try {
                if (this.bot) {
                    this.bot.stop();
                    console.log("✅ Bot stopped successfully");
                }

                console.log("👋 Goodbye!");
                process.exit(0);
            } catch (error) {
                console.error("❌ Error during shutdown:", error.message);
                process.exit(1);
            }
        };

        // Handle different shutdown signals
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGQUIT', () => shutdown('SIGQUIT'));

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error("❌ Uncaught Exception:", error);
            if (this.bot) {
                this.bot.emergencyStop();
            }
            process.exit(1);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
            if (this.bot) {
                this.bot.emergencyStop();
            }
            process.exit(1);
        });
    }
}

// Interactive mode functions
function showHelp() {
    console.log("\n🤖 Safe Uniswap Trading Bot");
    console.log("=" .repeat(40));
    console.log("Commands:");
    console.log("  start       - Start the trading bot");
    console.log("  simulate    - Run in simulation mode only");
    console.log("  test        - Test bot configuration");
    console.log("  help        - Show this help message");
    console.log("  version     - Show version information");
    console.log("\nExample:");
    console.log("  node run-bot.js start");
    console.log("  node run-bot.js simulate");
    console.log("\n⚠️  WARNING: This is for educational purposes only!");
}

function showVersion() {
    console.log("🤖 Safe Uniswap Trading Bot v1.0.0");
    console.log("📚 Educational DeFi Trading Bot");
    console.log("⚠️  For educational purposes only!");
}

async function testConfiguration() {
    console.log("🧪 Testing bot configuration...");
    
    try {
        const errors = validateConfig(config);
        if (errors.length > 0) {
            console.error("❌ Configuration errors found:");
            errors.forEach(error => console.error(`   - ${error}`));
            return false;
        }

        console.log("✅ Configuration is valid!");
        
        // Test bot initialization
        const testBot = new SafeUniswapBot(config);
        const initialized = await testBot.initialize();
        
        if (initialized) {
            console.log("✅ Bot initialization successful!");
            console.log("🎯 You can now run the bot with: node run-bot.js start");
            testBot.stop();
            return true;
        } else {
            console.error("❌ Bot initialization failed");
            return false;
        }
    } catch (error) {
        console.error("❌ Test failed:", error.message);
        return false;
    }
}

// Main execution
async function main() {
    const command = process.argv[2] || 'help';

    switch (command.toLowerCase()) {
        case 'start':
            const runner = new BotRunner();
            await runner.start();
            break;

        case 'simulate':
            // Force simulation mode
            config.simulateOnly = true;
            console.log("🧪 Running in simulation mode only");
            const simRunner = new BotRunner();
            await simRunner.start();
            break;

        case 'test':
            await testConfiguration();
            break;

        case 'version':
            showVersion();
            break;

        case 'help':
        default:
            showHelp();
            break;
    }
}

// Run the main function
if (require.main === module) {
    main().catch(error => {
        console.error("❌ Fatal error:", error);
        process.exit(1);
    });
}