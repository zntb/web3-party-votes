//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

error mint__gotToken();

contract Votoken is ERC20 {
    uint256 constant _one_token = 1 * (10 ** 18);
    address immutable owner;
    mapping(address => bool) private hasMinted;

    constructor() ERC20("Votoken", "VTK") {
        owner = msg.sender;
    }

    function mint() public {
        if (hasMinted[msg.sender]) {
            revert mint__gotToken();
        }
        _mint(msg.sender, _one_token);
        hasMinted[msg.sender] = true;
    }

    // Override transfer function to prevent transfers
    function transfer(address recipient, uint256 amount) public pure override returns (bool) {
        require(false, "This token cannot be transferred");
        return false;
    }

    // Override transferFrom function to prevent transfers
    function transferFrom(address sender, address recipient, uint256 amount) public pure override returns (bool) {
        require(false, "This token cannot be transferred");
        return false;
    }

    // Override approve function to prevent allowance approvals
    function approve(address spender, uint256 amount) public pure override returns (bool) {
        require(false, "Approval is not allowed for this token");
        return false;
    }
}
