const { ethers } = require("hardhat");

class ContractHelper {
    static async mineBlocks(count) {
        for(let i = 0; i < count; i++) {
            await ethers.provider.send("evm_mine", []);
        }
    }

    static async getBlockNumber() {
        return await ethers.provider.getBlockNumber();
    }
}

module.exports = ContractHelper;