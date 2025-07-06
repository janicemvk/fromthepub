// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title SafeUniswapInteraction
 * @dev Educational contract demonstrating safe Uniswap V3 interaction
 * @notice This is for educational purposes only. Do not use with real funds without proper testing and auditing.
 */
contract SafeUniswapInteraction is Ownable, ReentrancyGuard {
    ISwapRouter public immutable swapRouter;
    IUniswapV3Factory public immutable factory;
    
    // Uniswap V3 SwapRouter address on mainnet
    address public constant SWAP_ROUTER = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
    // Uniswap V3 Factory address on mainnet
    address public constant FACTORY = 0x1F98431c8aD98523631AE4a59f267346ea31F984;
    
    // Common token addresses (mainnet)
    address public constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public constant USDC = 0xA0b86a33E6417e8b1321A8F5B26f9A7F36ab1986;
    
    event SwapExecuted(
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );
    
    event PriceCheckCompleted(
        address indexed token0,
        address indexed token1,
        uint256 price
    );
    
    constructor() {
        swapRouter = ISwapRouter(SWAP_ROUTER);
        factory = IUniswapV3Factory(FACTORY);
    }
    
    /**
     * @dev Check price of token pair from Uniswap pool
     * @param tokenA First token address
     * @param tokenB Second token address
     * @param fee Pool fee tier (500, 3000, 10000)
     * @return price Current price ratio
     */
    function checkPrice(
        address tokenA,
        address tokenB,
        uint24 fee
    ) external view returns (uint256 price) {
        address poolAddress = factory.getPool(tokenA, tokenB, fee);
        require(poolAddress != address(0), "Pool does not exist");
        
        IUniswapV3Pool pool = IUniswapV3Pool(poolAddress);
        (uint160 sqrtPriceX96, , , , , , ) = pool.slot0();
        
        // Convert sqrtPriceX96 to price
        // This is a simplified calculation - in practice, you'd need more precision
        price = (uint256(sqrtPriceX96) * uint256(sqrtPriceX96)) >> 192;
        
        return price;
    }
    
    /**
     * @dev Execute a simple swap (for educational purposes)
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Amount of input token
     * @param amountOutMinimum Minimum amount of output token
     * @param fee Pool fee tier
     */
    function executeSwap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMinimum,
        uint24 fee
    ) external onlyOwner nonReentrant {
        require(amountIn > 0, "Amount must be greater than 0");
        require(tokenIn != tokenOut, "Cannot swap same token");
        
        // Transfer tokens from sender to this contract
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        // Approve the router to spend the token
        IERC20(tokenIn).approve(address(swapRouter), amountIn);
        
        // Set up swap parameters
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: fee,
                recipient: address(this),
                deadline: block.timestamp + 300, // 5 minutes from now
                amountIn: amountIn,
                amountOutMinimum: amountOutMinimum,
                sqrtPriceLimitX96: 0
            });
        
        // Execute the swap
        uint256 amountOut = swapRouter.exactInputSingle(params);
        
        // Transfer output tokens to owner
        IERC20(tokenOut).transfer(owner(), amountOut);
        
        emit SwapExecuted(tokenIn, tokenOut, amountIn, amountOut);
    }
    
    /**
     * @dev Get pool information
     * @param tokenA First token address
     * @param tokenB Second token address
     * @param fee Pool fee tier
     * @return poolAddress Address of the pool
     * @return liquidity Current liquidity
     * @return tick Current tick
     */
    function getPoolInfo(
        address tokenA,
        address tokenB,
        uint24 fee
    ) external view returns (
        address poolAddress,
        uint128 liquidity,
        int24 tick
    ) {
        poolAddress = factory.getPool(tokenA, tokenB, fee);
        require(poolAddress != address(0), "Pool does not exist");
        
        IUniswapV3Pool pool = IUniswapV3Pool(poolAddress);
        liquidity = pool.liquidity();
        (, tick, , , , , ) = pool.slot0();
    }
    
    /**
     * @dev Emergency withdrawal function
     * @param token Token address to withdraw
     */
    function emergencyWithdraw(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance > 0) {
            IERC20(token).transfer(owner(), balance);
        }
    }
    
    /**
     * @dev Withdraw ETH from contract
     */
    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Check if arbitrage opportunity exists between two pools
     * @param tokenA First token
     * @param tokenB Second token
     * @param fee1 First pool fee
     * @param fee2 Second pool fee
     * @return exists True if price difference exists
     * @return priceDiff Price difference percentage (scaled by 10000)
     */
    function checkArbitrageOpportunity(
        address tokenA,
        address tokenB,
        uint24 fee1,
        uint24 fee2
    ) external view returns (bool exists, uint256 priceDiff) {
        uint256 price1 = this.checkPrice(tokenA, tokenB, fee1);
        uint256 price2 = this.checkPrice(tokenA, tokenB, fee2);
        
        if (price1 > price2) {
            priceDiff = ((price1 - price2) * 10000) / price2;
        } else {
            priceDiff = ((price2 - price1) * 10000) / price1;
        }
        
        // Consider arbitrage opportunity if price difference > 0.1% (10 basis points)
        exists = priceDiff > 10;
    }
    
    // Allow contract to receive ETH
    receive() external payable {}
}