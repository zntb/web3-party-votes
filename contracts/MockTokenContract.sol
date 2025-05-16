// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockTokenContract {
    mapping(address => uint256) private balances;

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    function setBalance(address account, uint256 amount) external {
        balances[account] = amount;
    }
}
