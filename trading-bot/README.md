# Safe Uniswap Trading Bot

## ⚠️ CRITICAL WARNING ⚠️

**This is an educational project demonstrating how to build a trading bot. It is NOT intended for production use with real funds without extensive testing, auditing, and risk management.**

## 🎯 What This Bot Does

The Safe Uniswap Trading Bot is an educational project that demonstrates:

- **Price Monitoring**: Tracks prices across Uniswap V3 pools
- **Arbitrage Detection**: Identifies price differences between fee tiers
- **Automated Trading**: Executes trades when profitable opportunities arise
- **Risk Management**: Includes safety features and limits
- **Educational Value**: Shows how DeFi bots work in practice

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Trading Bot   │────│  Safe Contract   │────│ Uniswap V3 Pools│
│                 │    │                  │    │                 │
│ • Price Monitor │    │ • Access Control │    │ • WETH/USDC     │
│ • Arbitrage     │    │ • Safety Checks  │    │ • WETH/USDT     │
│ • Trade Logic   │    │ • Emergency Stop │    │ • USDC/USDT     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### 1. **Install Dependencies**
```bash
npm install node-cron dotenv
```

### 2. **Deploy the Safe Contract**
```bash
# First, deploy the safe contract
npm run compile
npm run deploy
```

### 3. **Configure the Bot**
```bash
# Copy environment template
cp trading-bot/.env.example .env

# Edit configuration
nano trading-bot/config.js
```

### 4. **Test Configuration**
```bash
npm run bot:test
```

### 5. **Run in Simulation Mode**
```bash
npm run bot:simulate
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file:
```bash
# Network Configuration
RPC_URL=https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=your_deployed_contract_address

# Environment
NODE_ENV=development  # development, staging, production
```

### Bot Configuration

Edit `trading-bot/config.js`:

```javascript
const config = {
    // SAFETY SETTINGS - CRITICAL!
    simulateOnly: true,  // Keep true until ready for real trading
    testnet: true,       // Use testnet for development
    
    // Trading Parameters
    tradeAmount: 0.01,           // Amount in ETH per trade
    minProfitThreshold: 0.5,     // Minimum profit % to execute
    maxSlippage: 5,              // Maximum slippage %
    
    // Risk Management
    maxDailyTrades: 50,          // Limit trades per day
    maxDailyLoss: 0.1,           // Stop if daily loss exceeds
    stopLossThreshold: 0.05,     // Individual trade stop loss
};
```

## 🤖 Bot Commands

### Available Commands
```bash
# Show help
npm run bot:help

# Test configuration
npm run bot:test

# Run simulation mode (safe)
npm run bot:simulate

# Start real trading (DANGEROUS!)
npm run bot:start
```

### Direct Node.js Commands
```bash
# Alternative syntax
node trading-bot/run-bot.js help
node trading-bot/run-bot.js test
node trading-bot/run-bot.js simulate
node trading-bot/run-bot.js start
```

## 📊 How It Works

### 1. **Price Monitoring** (Every 30 seconds)
- Fetches prices from Uniswap V3 pools
- Tracks price history and changes
- Alerts on significant movements

### 2. **Arbitrage Detection** (Every 2 minutes)
- Compares prices between different fee tiers
- Calculates potential profit
- Identifies opportunities above threshold

### 3. **Trade Execution** (Every 5 minutes)
- Evaluates detected opportunities
- Executes most profitable trades
- Manages risk and slippage

### 4. **Safety Features**
- **Simulation Mode**: Test without real money
- **Access Control**: Only contract owner can trade
- **Emergency Stop**: Immediate shutdown capability
- **Risk Limits**: Daily trade and loss limits

## 📈 Trading Strategy

### Current Strategy: Fee Tier Arbitrage
The bot looks for price differences between Uniswap V3 pools with different fee tiers:

- **0.05% fee pools** (500): Stable pairs, low fees
- **0.3% fee pools** (3000): Most common, balanced
- **1% fee pools** (10000): Exotic pairs, high fees

### Example Opportunity
```
WETH/USDC Price Difference:
- 0.3% pool: 1 ETH = 2000 USDC
- 1% pool:   1 ETH = 2010 USDC
- Arbitrage: 0.5% profit (10 USDC per ETH)
```

## 🔒 Security Features

### Contract-Level Security
- **Access Control**: Only owner can execute trades
- **Reentrancy Protection**: Prevents attack vectors
- **Emergency Withdrawal**: Recover stuck funds
- **Input Validation**: Prevents malicious parameters

### Bot-Level Security
- **Simulation Mode**: Test without risk
- **Configuration Validation**: Prevents misconfiguration
- **Graceful Shutdown**: Safe stop procedures
- **Error Handling**: Robust error recovery

## ⚠️ Risks and Limitations

### Technical Risks
1. **Smart Contract Bugs**: Contract vulnerabilities
2. **Bot Logic Errors**: Faulty trading algorithms
3. **Network Issues**: RPC failures, gas spikes
4. **MEV Competition**: Other bots front-running

### Financial Risks
1. **Market Risk**: Price movements against trades
2. **Slippage**: Execution price worse than expected
3. **Gas Costs**: High network fees eating profits
4. **Liquidity Risk**: Insufficient pool liquidity

### Operational Risks
1. **Configuration Errors**: Wrong parameters
2. **API Failures**: RPC provider issues
3. **Private Key Exposure**: Security breaches
4. **Regulatory Risk**: Legal compliance issues

## 🧪 Testing Strategy

### Phase 1: Simulation (Safe)
```bash
# Run simulation mode
npm run bot:simulate

# What it does:
# ✅ Monitors real prices
# ✅ Detects real opportunities
# ✅ Logs trade decisions
# ❌ Does NOT execute trades
```

### Phase 2: Testnet (Low Risk)
```bash
# Configure for testnet
NODE_ENV=staging npm run bot:start

# What you need:
# - Testnet ETH (free)
# - Testnet contract deployment
# - Testnet RPC endpoint
```

### Phase 3: Mainnet Small Scale (High Risk)
```bash
# ONLY after extensive testing!
NODE_ENV=production npm run bot:start

# Start with:
# - Small trade amounts (0.01 ETH)
# - Conservative profit thresholds
# - Tight risk limits
```

## 💡 Best Practices

### Development
1. **Always Start in Simulation Mode**
2. **Test on Testnets First**
3. **Use Small Amounts Initially**
4. **Monitor Logs Carefully**
5. **Have Emergency Procedures**

### Production (If Ever)
1. **Professional Security Audit**
2. **Gradual Capital Allocation**
3. **24/7 Monitoring Systems**
4. **Comprehensive Logging**
5. **Regular Risk Assessment**

### Risk Management
1. **Set Conservative Limits**
2. **Never Risk More Than You Can Lose**
3. **Diversify Strategies**
4. **Monitor Gas Costs**
5. **Have Exit Strategies**

## 🔧 Troubleshooting

### Common Issues

#### Configuration Errors
```bash
❌ Configuration errors:
   - Private key is required
   - RPC URL with valid API key is required

💡 Solution: Update .env file with valid values
```

#### Connection Issues
```bash
❌ Bot initialization failed: Network error

💡 Solutions:
- Check RPC URL and API key
- Verify network connectivity
- Try different RPC provider
```

#### Permission Errors
```bash
⚠️ WARNING: Bot wallet is not the contract owner!

💡 Solution: Use the wallet that deployed the contract
```

### Debug Mode
```bash
# Enable detailed logging
NODE_ENV=development npm run bot:start
```

## 📚 Educational Resources

### Understanding MEV
- [MEV Research](https://ethereum.org/en/developers/docs/mev/)
- [Flashboys 2.0](https://arxiv.org/abs/1904.05234)
- [MEV Protection](https://docs.flashbots.net/)

### Uniswap V3
- [Uniswap V3 Whitepaper](https://uniswap.org/whitepaper-v3.pdf)
- [Concentrated Liquidity](https://docs.uniswap.org/concepts/protocol/concentrated-liquidity)
- [Fee Tiers](https://docs.uniswap.org/concepts/protocol/fees)

### DeFi Security
- [Smart Contract Security](https://consensys.github.io/smart-contract-best-practices/)
- [DeFi Risks](https://blog.openzeppelin.com/defi-security-best-practices/)
- [MEV Protection](https://ethereum.org/en/developers/docs/mev/#mev-protection)

## 🆘 Emergency Procedures

### If Something Goes Wrong

#### 1. **Immediate Actions**
```bash
# Stop the bot immediately
Ctrl+C  # or kill the process

# Emergency contract stop
node -e "
const bot = require('./trading-bot/bot');
const config = require('./trading-bot/config');
const b = new bot(config);
b.initialize().then(() => b.emergencyStop());
"
```

#### 2. **Recovery Actions**
```bash
# Withdraw funds from contract
npx hardhat run scripts/emergency-withdraw.js --network mainnet

# Check transaction logs
npx hardhat run scripts/check-logs.js --network mainnet
```

#### 3. **Analysis**
- Review bot logs
- Check transaction history
- Analyze profit/loss
- Identify root cause

## 📄 License and Disclaimer

### License
MIT License - See LICENSE file for details.

### Disclaimer
This software is provided for educational purposes only. The authors are not responsible for any financial losses or damages arising from the use of this software. 

**By using this software, you acknowledge that:**

1. You understand the risks involved in automated trading
2. You will not risk more than you can afford to lose
3. You will test thoroughly before using real funds
4. You are responsible for compliance with applicable laws
5. The software is provided "as is" without warranties

## 🤝 Contributing

This is an educational project. Contributions are welcome, but please:

1. **Prioritize Safety**: All contributions must enhance safety
2. **Add Tests**: Include comprehensive test coverage
3. **Document Changes**: Update documentation accordingly
4. **Follow Conventions**: Maintain code style and patterns

## 💬 Support

For educational questions and discussions:

1. **Read the Documentation**: Start with this README
2. **Check Examples**: Review the provided code
3. **Test Safely**: Always use simulation mode first
4. **Share Learnings**: Contribute to the educational community

---

**Remember: The goal is learning, not profit. Trade responsibly!** 🎓