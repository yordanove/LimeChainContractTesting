const { expect } = require("chai");
const { QUANTITIES, REFUND_POLICY } = require("../constants/productData");
const { ERRORS } = require("../constants/errorMessages");
const testProducts = require("../fixtures/testProducts.json");
const StoreFactory = require("../factories/StoreFactory");
const { mineBlocks } = require("../helpers/ContractHelper");
const StorePage = require("../pages/StorePage");

describe("Refund Policy", function () {
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

    it("Should handle multiple refunds within time limit", async function () {
        const productId = 0;
        const startQuantity = Number(
            (await storePage.getProduct(productId)).quantity
        );

        await storePage.buyProduct(productId);
        await storePage.refundProduct(productId);

        await buyer2Page.buyProduct(productId);
        await buyer2Page.refundProduct(productId);

        const finalQuantity = Number(
            (await storePage.getProduct(productId)).quantity
        );
        expect(finalQuantity).to.equal(startQuantity - 2);
    });

    it("Should handle refund for non-bought and already refunded products", async function () {
        const productId = 0;
        await ownerPage.setRefundPolicyNumber(REFUND_POLICY.LONG);

        // Try refund without buying
        await expect(storePage.refundProduct(productId))
            .to.be.revertedWith(ERRORS.NO_REFUND);

        // Buy and refund
        await storePage.buyProduct(productId);
        await storePage.refundProduct(productId);

        // Try second refund
        await expect(storePage.refundProduct(productId))
            .to.be.revertedWith(ERRORS.NO_REFUND);
    });

    it("Should enforce refund time limits", async function () {
        const productId = 0;
        await storePage.buyProduct(productId);

        // In time
        await mineBlocks(REFUND_POLICY.SHORT);
        await expect(storePage.refundProduct(productId)).not.to.be.reverted;

        // Buy again and test out of time
        await storePage.buyProduct(productId);
        await mineBlocks(REFUND_POLICY.LONG);
        await expect(storePage.refundProduct(productId))
            .to.be.revertedWith(ERRORS.REFUND_DENIED);
    });

    it("Should validate refund policy updates", async function () {
        // Test non-owner access
        await expect(storePage.setRefundPolicyNumber(50))
            .to.be.revertedWith(ERRORS.NOT_OWNER);

        // Test valid owner updates
        await ownerPage.setRefundPolicyNumber(REFUND_POLICY.MIN);
        let policy = await storePage.getRefundPolicyNumber();
        expect(Number(policy)).to.equal(REFUND_POLICY.MIN);

        await ownerPage.setRefundPolicyNumber(REFUND_POLICY.MAX);
        policy = await storePage.getRefundPolicyNumber();
        expect(Number(policy)).to.equal(REFUND_POLICY.MAX);
    });

    it("Should emit correct refund events", async function () {
        const productId = 0;

        await storePage.buyProduct(productId);

        await expect(storePage.refundProduct(productId))
            .to.emit(storeData.contract, "ProductRefund")
            .withArgs(productId);
    });

    it("Should correctly update quantities after refund", async function () {
        const productId = 0;
        await ownerPage.addProduct("RefundTest", QUANTITIES.LOW);
        const testId = 1;

        await storePage.buyProduct(testId);
        await storePage.refundProduct(testId);

        const product = await storePage.getProduct(testId);
        expect(Number(product.quantity)).to.equal(1); // QUANTITIES.LOW - 1
    });

    it("Should validate product existence in refund", async function () {
        // Test non-existent product refund - hits productExist modifier else path
        await expect(storePage.refundProduct(999))
            .to.be.revertedWith(ERRORS.PRODUCT_NOT_EXISTS);

        // Verify successful refund still works
        const productId = 0;
        await storePage.buyProduct(productId);
        await expect(storePage.refundProduct(productId))
            .to.emit(storeData.contract, "ProductRefund");
    });
});
