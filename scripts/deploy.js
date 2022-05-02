// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
// const hre = require("hardhat");
require("dotenv").config();
// const fs = require("fs");
const { ethers } = require("hardhat");

async function main() {
    var [owner] = await ethers.getSigners();
    let network = await owner.provider._networkPromise;
    console.log("ChainId: ", network.chainId);

    const USDCAddress = process.env.USDCADDRESS;

    // $SBC token deployment
    const PresaleTokenContract = await ethers.getContractFactory("ERC20");
    const SBCToken = await PresaleTokenContract.deploy("Spinblade Coin", "SBC");
    await SBCToken.deployed();

    console.log("Token deployed to:", SBCToken.address);

    // presale Contract deployment
    const PresaleContract = await ethers.getContractFactory("Presale");
    const deployedPresaleContract = await PresaleContract.deploy(
        SBCToken.address,
        USDCAddress
    );

    await deployedPresaleContract.deployed();

    console.log(
        "Presale Contract deployed to:",
        deployedPresaleContract.address
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
