//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./ERC20.sol";
import "hardhat/console.sol";

contract Presale is Ownable {
    event ClaimWithdraw(address to, uint256 amount);

    struct UserInfo {
        uint256 saleStart;

        uint256 TotalAmount;
        uint256 unlockedAmount;
        uint256 totalPercent;
    }

    struct PublicPeriod {
        uint256 cliffTerm;
        uint256 vestTerm;
        uint256 presaleTerm;
        uint256 maxAmount;
        uint256 roundAmount;
    }

    PublicPeriod public publicPeriod;

    address public tokenAddress;
    address public usdcAddress;

    uint256 public startTime;

    mapping(address => UserInfo) userInfo;

    constructor(
        address _tokenAddress,
        address _usdcAddress
    ) {
        tokenAddress = _tokenAddress;
        usdcAddress = _usdcAddress;
    }

    function setPeriod(PublicPeriod memory _period) public onlyOwner {
        publicPeriod = _period;
        startTime = block.timestamp;
    }

    function resetPeriod(PublicPeriod memory _period) public onlyOwner {
        publicPeriod = _period;
    }

    function buy(uint256 amount) public {
        uint256 usdcAmount = (amount * getPrice() / 1e6);

        ERC20(usdcAddress).transferFrom(msg.sender, owner(), usdcAmount);

        require(startTime < block.timestamp && block.timestamp < startTime + publicPeriod.presaleTerm, "End presale term");

        userInfo[_msgSender()].TotalAmount += amount;
        userInfo[_msgSender()].saleStart = block.timestamp;
        publicPeriod.roundAmount += amount;

        require(publicPeriod.roundAmount < ERC20(tokenAddress).totalSupply() * 2 / 100, "Full Round Amount");
        require(publicPeriod.maxAmount > userInfo[_msgSender()].TotalAmount, "Full Presale Amount");
    }

    function claim() public {
        uint256 userStartTime = userInfo[_msgSender()].saleStart;
        require(userStartTime + publicPeriod.cliffTerm > block.timestamp, "Can't claim yet");

        unlockableAmount(_msgSender());
        require(userInfo[_msgSender()].totalPercent != 0, "Can't claim yet");

        uint256 availableAmount = userInfo[_msgSender()].TotalAmount * userInfo[_msgSender()].totalPercent / 1e6;
        uint256 correctAmount = (availableAmount - userInfo[_msgSender()].unlockedAmount);

        ERC20(tokenAddress).transfer(_msgSender(), correctAmount);
        userInfo[_msgSender()].unlockedAmount += correctAmount;

        emit ClaimWithdraw(_msgSender(), correctAmount);
    }

    function unlockableAmount(address _address) public {
        if(block.timestamp > userInfo[_address].saleStart + publicPeriod.cliffTerm) {
            // decimal 10 ** 6
            userInfo[_address].totalPercent += 5000000;
            userInfo[_address].totalPercent += (block.timestamp - publicPeriod.cliffTerm) / (24 * 3600 * 30) * 528000;
            require((block.timestamp - publicPeriod.cliffTerm) / (24 * 3600 * 30) < publicPeriod.vestTerm);
        } else {
            userInfo[_address].totalPercent = 0;
        }
    }

    function getTotalAmount(address _address) public view returns (uint256) {
        return userInfo[_address].TotalAmount;
    }

    function getPrice() public pure returns (uint256) {
        // decimal 10 ** 6
        return 12500;
    }

    // receive() external payable {
    //     buy();
    // }

    // fallback() external payable {
    //     buy();
    // }
}
