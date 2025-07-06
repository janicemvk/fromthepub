/**
 * @title Safe Uniswap Trading Bot Configuration
 * @dev Configuration settings for the educational trading bot
 * @notice IMPORTANT: This is for educational purposes only!
 */

const config = {
    // Network Configuration
    rpcUrl: process.env.RPC_URL || "https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY",
    privateKey: process.env.PRIVATE_KEY || "YOUR_PRIVATE_KEY_HERE",
    contractAddress: process.env.CONTRACT_ADDRESS || "YOUR_CONTRACT_ADDRESS_HERE",
    
    // SAFETY SETTINGS
    simulateOnly: true, // SET TO false ONLY WHEN READY FOR REAL TRADING
    testnet: true, // Use testnet for development
    
    // Trading Parameters
    tradeAmount: 0.01, // Amount in ETH to trade (start small!)
    minProfitThreshold: 0.5, // Minimum profit percentage to execute trade
    maxSlippage: 5, // Maximum slippage in percentage
    
    // Price Monitoring
    priceAlertThreshold: 2, // Alert when price moves more than this percentage
    
    // Trading Pairs to Monitor
    tradingPairs: [
        {
            symbol: "WETH/USDC",
            token0: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
            token1: "0xA0b86a33E6417e8b1321A8F5b26f9A7F36Ab1986", // USDC
            fee: 3000 // 0.3%
        },
        {
            symbol: "WETH/USDT",
            token0: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
            token1: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
            fee: 3000 // 0.3%
        },
        {
            symbol: "USDC/USDT",
            token0: "0xA0b86a33E6417e8b1321A8F5b26f9A7F36Ab1986", // USDC
            token1: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
            fee: 100 // 0.01%
        }
    ],
    
    // Common Token Addresses (Mainnet)
    tokens: {
        WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        USDC: "0xA0b86a33E6417e8b1321A8F5b26f9A7F36Ab1986",
        USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"
    },
    
    // Testnet Configuration (Goerli)
    testnetConfig: {
        rpcUrl: "https://goerli.infura.io/v3/YOUR_INFURA_KEY",
        tokens: {
            WETH: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
            USDC: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
            DAI: "0x73967c6a0904aA032C103b4104747E88c566B1A2"
        }
    },
    
    // Advanced Settings
    advanced: {
        gasLimit: 500000, // Gas limit for transactions
        maxGasPrice: 50, // Maximum gas price in gwei
        retryAttempts: 3, // Number of retry attempts for failed transactions
        retryDelay: 5000, // Delay between retries in milliseconds
        
        // MEV Protection
        flashloanProtection: true, // Enable protection against flashloan attacks
        frontrunProtection: true, // Enable protection against frontrunning
        
        // Risk Management
        maxDailyTrades: 50, // Maximum number of trades per day
        maxDailyLoss: 0.1, // Maximum daily loss in ETH
        stopLossThreshold: 0.05, // Stop loss threshold in ETH
        
        // Logging
        logLevel: "info", // debug, info, warn, error
        logToFile: true, // Save logs to file
        logDirectory: "./logs"
    }
};

// Validation function
function validateConfig(config) {
    const errors = [];
    
    // Required fields
    if (!config.privateKey || config.privateKey === "YOUR_PRIVATE_KEY_HERE") {
        errors.push("Private key is required");
    }
    
    if (!config.contractAddress || config.contractAddress === "YOUR_CONTRACT_ADDRESS_HERE") {
        errors.push("Contract address is required");
    }
    
    if (!config.rpcUrl || config.rpcUrl.includes("YOUR_API_KEY")) {
        errors.push("RPC URL with valid API key is required");
    }
    
    // Safety checks
    if (!config.simulateOnly && !config.testnet) {
        console.warn("⚠️  WARNING: You are about to run the bot with real funds on mainnet!");
        console.warn("   Make sure you understand the risks and have tested thoroughly.");
    }
    
    if (config.tradeAmount > 0.1) {
        console.warn("⚠️  WARNING: Trade amount is quite large. Consider starting smaller.");
    }
    
    if (config.minProfitThreshold < 0.1) {
        console.warn("⚠️  WARNING: Minimum profit threshold is very low. This may lead to unprofitable trades due to gas costs.");
    }
    
    return errors;
}

// Environment-specific configurations
const getConfig = () => {
    const env = process.env.NODE_ENV || 'development';
    
    switch (env) {
        case 'production':
            return {
                ...config,
                simulateOnly: false,
                testnet: false,
                advanced: {
                    ...config.advanced,
                    logLevel: 'warn'
                }
            };
            
        case 'staging':
            return {
                ...config,
                testnet: true,
                simulateOnly: false,
                rpcUrl: config.testnetConfig.rpcUrl,
                tokens: config.testnetConfig.tokens
            };
            
        case 'development':
        default:
            return {
                ...config,
                simulateOnly: true,
                testnet: true
            };
    }
};

module.exports = {
    config: getConfig(),
    validateConfig,
    
    // Helper function to create custom config
    createConfig: (overrides = {}) => {
        return { ...config, ...overrides };
    }
};