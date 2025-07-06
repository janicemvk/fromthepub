# Safe Uniswap Interaction Contract

## ⚠️ SECURITY WARNING ⚠️

**The original code you provided was a SCAM/HONEYPOT contract designed to steal funds. DO NOT USE IT.**

This repository contains a safe, educational alternative that demonstrates legitimate Uniswap V3 interaction patterns.

## What This Contract Does

The `SafeUniswapInteraction` contract provides:

1. **Price Checking**: Get current prices from Uniswap V3 pools
2. **Safe Swaps**: Execute token swaps with proper security controls
3. **Pool Information**: Retrieve liquidity and other pool data
4. **Arbitrage Detection**: Check for price differences between pools
5. **Emergency Controls**: Owner-only withdrawal functions

## Key Security Features

- ✅ **Access Control**: Uses OpenZeppelin's `Ownable` for admin functions
- ✅ **Reentrancy Protection**: Prevents reentrancy attacks
- ✅ **Input Validation**: Proper checks on all parameters
- ✅ **Emergency Withdrawals**: Owner can recover stuck funds
- ✅ **Modern Solidity**: Uses latest version with security improvements
- ✅ **Clear Documentation**: Well-commented code with no obfuscation

## Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set up Environment**:
   - Get an Alchemy API key
   - Update `hardhat.config.js` with your API key
   - Consider using a `.env` file for sensitive data

3. **Compile Contract**:
   ```bash
   npm run compile
   ```

4. **Deploy Contract**:
   ```bash
   npm run deploy
   ```

## Usage Examples

### Check Token Prices

```javascript
// Get WETH/USDC price from 0.3% fee pool
const price = await contract.checkPrice(
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
  "0xA0b86a33E6417e8b1321A8F5B26f9A7F36ab1986", // USDC
  3000 // 0.3% fee
);
```

### Execute a Swap

```javascript
// Execute WETH to USDC swap (owner only)
await contract.executeSwap(
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
  "0xA0b86a33E6417e8b1321A8F5B26f9A7F36ab1986", // USDC
  ethers.utils.parseEther("1"), // 1 WETH
  1000000, // Min 1 USDC out
  3000 // 0.3% fee
);
```

### Check Arbitrage Opportunities

```javascript
// Check price difference between 0.3% and 1% fee pools
const [exists, priceDiff] = await contract.checkArbitrageOpportunity(
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
  "0xA0b86a33E6417e8b1321A8F5B26f9A7F36ab1986", // USDC
  3000, // 0.3% fee
  10000 // 1% fee
);
```

## Security Considerations

### For Learning/Testing

1. **Use Testnets**: Deploy on Goerli, Sepolia, or other testnets first
2. **Small Amounts**: Start with minimal test tokens
3. **Understand Risks**: MEV/arbitrage trading is highly competitive
4. **Monitor Gas**: Failed transactions can be expensive

### For Production (Not Recommended)

If you decide to use this in production (not recommended without professional audit):

1. **Professional Audit**: Have the contract audited by security experts
2. **Gradual Deployment**: Start with small amounts and limited functionality
3. **Monitoring**: Implement comprehensive monitoring and alerting
4. **Multisig**: Use multisig wallet for ownership
5. **Upgrades**: Consider using upgradeable patterns
6. **Insurance**: Consider smart contract insurance

## Differences from the Scam Contract

| Aspect | Scam Contract | Safe Contract |
|--------|---------------|---------------|
| Purpose | Steal funds | Educational/legitimate trading |
| Code clarity | Obfuscated | Clear and documented |
| Security | None | Multiple layers |
| Access control | None | Owner-only critical functions |
| Withdrawals | To scammer | To legitimate owner |
| Functionality | Fake | Real Uniswap integration |

## Common MEV/Arbitrage Risks

1. **Front-running**: Other bots may front-run your transactions
2. **Sandwich attacks**: Your trades may be sandwiched
3. **Gas wars**: Competition can drive gas prices up
4. **Slippage**: Prices may move against you
5. **Failed transactions**: Reverted transactions still cost gas

## Contributing

This is an educational project. Contributions are welcome, but please:

1. Maintain security best practices
2. Include comprehensive tests
3. Update documentation
4. Follow Solidity style guidelines

## License

MIT License - See LICENSE file for details.

## Disclaimer

This code is for educational purposes only. The authors are not responsible for any losses incurred from using this code. Always perform due diligence and consider professional auditing before using any smart contract with real funds.

## Resources

- [Uniswap V3 Documentation](https://docs.uniswap.org/sdk/v3/overview)
- [OpenZeppelin Security Best Practices](https://docs.openzeppelin.com/contracts/4.x/security)
- [Ethereum Smart Contract Security](https://consensys.github.io/smart-contract-best-practices/)
- [MEV Research](https://ethereum.org/en/developers/docs/mev/)