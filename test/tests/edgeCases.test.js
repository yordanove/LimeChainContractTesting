const { expect } = require("chai");
const { QUANTITIES } = require("../constants/productData");
const { ERRORS } = require("../constants/errorMessages");
const testProducts = require("../fixtures/testProducts.json");
const StoreFactory = require("../factories/StoreFactory");
const StorePage = require("../pages/StorePage");
const { mineBlocks } = require("../helpers/ContractHelper");

describe("Edge Cases", function () {
    let storePage;
    let ownerPage;
    let buyer2Page;
    let buyer3Page;
    let storeData;

    beforeEach(async function () {
        storeData = await StoreFactory.deploy();
        ownerPage = new StorePage(storeData.contract, storeData.owner);
        storePage = new StorePage(storeData.contract, storeData.buyer1);
        buyer2Page = new StorePage(storeData.contract, storeData.buyer2);
        buyer3Page = new StorePage(storeData.contract, storeData.buyer3);

        await ownerPage.addProduct(testProducts.standard.name, QUANTITIES.PURCHASE_DEFAULT);
    });

    describe("Non-existent Product Scenarios", function () {
        it("Should validate operations on non-existent products", async function () {
            // Test get operations
            await expect(storePage.getProduct(999))
                .to.be.revertedWith(ERRORS.PRODUCT_NOT_EXISTS);

            await expect(storePage.buyProduct(999))
                .to.be.revertedWithPanic(0x32);

            await expect(storePage.getProductByName("NonExistent"))
                .to.be.revertedWith(ERRORS.PRODUCT_NOT_EXISTS);

            // Test buyers list - hits productExist modifier
            await expect(storePage.getProductBuyers(999))
                .to.be.revertedWith(ERRORS.PRODUCT_NOT_EXISTS);

            // Test valid buyers list access
            const validBuyers = await storePage.getProductBuyers(0);
            expect(Array.isArray(validBuyers)).to.be.true;
        });

        it("Should enforce existence checks across operations", async function () {
            await ownerPage.addProduct("ExistenceTest", QUANTITIES.LOW);
            const productId = 1;

            await expect(ownerPage.updateProductQuantity(999, QUANTITIES.HIGH))
                .to.be.revertedWith(ERRORS.PRODUCT_NOT_EXISTS);

            await storePage.buyProduct(productId);
            await storePage.refundProduct(productId);
            const product = await storePage.getProduct(productId);
            expect(Number(product.quantity)).to.equal(1);
        });
    });

    describe("Modifier and State Transitions", function () {
        it("Should handle refund policy updates", async function () {
            // Test non-owner access - hits onlyOwner modifier
            await expect(storePage.setRefundPolicyNumber(50))
                .to.be.revertedWith(ERRORS.NOT_OWNER);

            // Test valid owner update
            await ownerPage.setRefundPolicyNumber(50);
            const newPolicy = await storePage.getRefundPolicyNumber();
            expect(Number(newPolicy)).to.equal(50);
        });

        it("Should validate name checks thoroughly", async function () {
            // Empty name validation
            await expect(ownerPage.addProduct("", 5))
                .to.be.revertedWith(ERRORS.EMPTY_NAME);

            // Get product with empty name
            await expect(storePage.getProductByName(""))
                .to.be.revertedWith(ERRORS.EMPTY_NAME);

            // Successful path
            await ownerPage.addProduct("ValidName", 5);
            const product = await storePage.getProductByName("ValidName");
            expect(product.name).to.equal("ValidName");
        });
    });

    describe("Quantity Edge Cases", function () {
        it("Should handle uint16 boundary values", async function () {
            await ownerPage.addProduct("MaxProduct", QUANTITIES.MAX_UINT16);
            const product = await storePage.getProduct(1);
            expect(Number(product.quantity)).to.equal(QUANTITIES.MAX_UINT16);
        });

        it("Should handle sequential quantity depletion", async function () {
            await ownerPage.addProduct("LowQuantityProduct", QUANTITIES.LOW);
            const productId = 1;

            await storePage.buyProduct(productId);
            await buyer2Page.buyProduct(productId);

            const product = await storePage.getProduct(productId);
            expect(Number(product.quantity)).to.equal(0);

            await expect(buyer3Page.buyProduct(productId))
                .to.be.revertedWith(ERRORS.ZERO_QUANTITY);
        });
    });

    describe("State Consistency", function () {
        it("Should maintain state through complex operations", async function () {
            await ownerPage.addProduct("StateTest", QUANTITIES.DEFAULT);
            const productId = 1;

            await storePage.buyProduct(productId);
            await ownerPage.updateProductQuantity(productId, QUANTITIES.HIGH);

            const product = await storePage.getProduct(productId);
            expect(Number(product.quantity)).to.equal(QUANTITIES.HIGH);
            const buyers = await storePage.getProductBuyers(productId);
            expect(buyers).to.include(storeData.buyer1.address);
        });
    });
});
