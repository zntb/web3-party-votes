//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Custom error for when user already minted
error MintAlreadyMinted();

contract Votoken is ERC20 {
    uint256 constant ONE_TOKEN = 1 * (10 ** 18);
    address public immutable owner;
    mapping(address => bool) private hasMinted;

    constructor() ERC20("Votoken", "VTK") {
        owner = msg.sender;
    }

    function mint() public {
        if (hasMinted[msg.sender]) {
            revert MintAlreadyMinted();
        }
        _mint(msg.sender, ONE_TOKEN);
        hasMinted[msg.sender] = true;
    }

    // Override transfer function to prevent transfers
    function transfer(address, /*recipient*/ uint256 /*amount*/ ) public pure override returns (bool) {
        revert("This token cannot be transferred");
    }

    // Override transferFrom function to prevent transfers
    function transferFrom(address, /*sender*/ address, /*recipient*/ uint256 /*amount*/ )
        public
        pure
        override
        returns (bool)
    {
        revert("This token cannot be transferred");
    }

    // Override approve function to prevent allowance approvals
    function approve(address, /*spender*/ uint256 /*amount*/ ) public pure override returns (bool) {
        revert("Approval is not allowed for this token");
    }

    // Check if an address has already minted
    function hasAlreadyMinted(address user) public view returns (bool) {
        return hasMinted[user];
    }
}
