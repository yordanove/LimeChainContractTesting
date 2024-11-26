const { ethers } = require("hardhat");

class StoreFactory {
    static async deploy() {
        const [owner, buyer1, buyer2, buyer3] = await ethers.getSigners();
        const Store = await ethers.getContractFactory("Store");
        const store = await Store.deploy();
        await store.waitForDeployment();
        
        return {
            contract: store,
            owner,
            buyer1,
            buyer2,
            buyer3
        };
    }

    static createProductData(name = "TestProduct", quantity = 5) {
        return {
            name,
            quantity
        };
    }

    static createMultipleProducts(count) {
        return Array.from({ length: count }, (_, i) => ({
            name: `Product${i + 1}`,
            quantity: (i + 1) * 5
        }));
    }
}

module.exports = StoreFactory;