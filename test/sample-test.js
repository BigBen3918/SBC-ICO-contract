const { ethers } = require("hardhat");

describe("TEST Presale", function () {
    var Tcontract = null,
        Pcontract = null,
        USDCContract;

    it("Should deploy presale token", async function () {
        const _USDCContract = await ethers.getContractFactory("ERC20");
        USDCContract = await _USDCContract.deploy("USDC", "USDC");
        await USDCContract.deployed();

        const PresaleTokenContract = await ethers.getContractFactory("ERC20");
        const deployedSBCToken = await PresaleTokenContract.deploy(
            "Spinblade Coin",
            "SBC"
        );
        await deployedSBCToken.deployed();

        console.log("Token deployed to:", deployedSBCToken.address);

        const PresaleContract = await ethers.getContractFactory("Presale");
        const deployedPresaleContract = await PresaleContract.deploy(
            deployedSBCToken.address,
            USDCContract.address
        );

        await deployedPresaleContract.deployed();

        console.log(
            "Presale Contract deployed to: ",
            deployedPresaleContract.address
        );

        Tcontract = deployedSBCToken;
        Pcontract = deployedPresaleContract;
    });

    it("Should set Period", async function () {
        var Period = {
            cliffTerm: ethers.utils.parseUnits("5000", 0), // 300000 QE/ETH // 1e6
            vestTerm: ethers.utils.parseUnits("18000", 0), // 3000 QE/ETH // 1e6
            presaleTerm: ethers.utils.parseUnits("1000", 0),
            maxAmount: ethers.utils.parseUnits("100000", 0),
            roundAmount: ethers.utils.parseUnits("20000000", 0),
        };

        var tx = await Pcontract.setPeriod(Period);
        await tx.wait();
    });

    it("Should Buy", async function () {
        
        var tx = await USDCContract.approve(Pcontract.address,ethers.utils.parseUnits("100000000000000000000"));
        await tx.wait();
        await Pcontract.buy(ethers.utils.parseUnits("1000", 0));
        await Pcontract.buy(ethers.utils.parseUnits("1000", 0));
        await Pcontract.buy(ethers.utils.parseUnits("1000", 0));
        await Pcontract.buy(ethers.utils.parseUnits("1000", 0));
        await Pcontract.buy(ethers.utils.parseUnits("1000", 0));
    });
});
