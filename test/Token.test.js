const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GovToken", function () {
  let govToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const GovToken = await ethers.getContractFactory("GovToken");
    govToken = await GovToken.deploy(owner.address);
    await govToken.waitForDeployment();
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("100");  // 100 tokens
      await govToken.mint(addr1.address, mintAmount);
      
      expect(await govToken.balanceOf(addr1.address)).to.equal(mintAmount);
    });

    it("Should not allow non-owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("100");  // 100 tokens
      
      // Try to mint from addr1 (non-owner)
      await expect(
        govToken.connect(addr1).mint(addr2.address, mintAmount)
      ).to.be.revertedWithCustomError(govToken, "OwnableUnauthorizedAccount");
    });

    it("Should emit Transfer event when minting", async function () {
      const mintAmount = ethers.parseEther("100");  // 100 tokens
      
      await expect(govToken.mint(addr1.address, mintAmount))
        .to.emit(govToken, "Transfer")
        .withArgs(ethers.ZeroAddress, addr1.address, mintAmount);
    });

    it("Should increase total supply when minting", async function () {
      const initialSupply = await govToken.totalSupply();
      const mintAmount = ethers.parseEther("100");  // 100 tokens
      
      await govToken.mint(addr1.address, mintAmount);
      
      expect(await govToken.totalSupply()).to.equal(initialSupply + mintAmount);
    });
  });
});
