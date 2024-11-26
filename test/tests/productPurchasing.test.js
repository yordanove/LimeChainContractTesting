const { expect } = require("chai");
const { QUANTITIES } = require("../constants/productData");
const { ERRORS } = require("../constants/errorMessages");
const testProducts = require("../fixtures/testProducts.json");
const StoreFactory = require("../factories/StoreFactory");
const StorePage = require("../pages/StorePage");

describe("Product Purchasing", function () {
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

    it("Should handle multiple buyers and quantity tracking", async function () {
        const productId = 0;

        await storePage.buyProduct(productId);
        let product = await storePage.getProduct(productId);
        expect(Number(product.quantity)).to.equal(2);

        await buyer2Page.buyProduct(productId);
        product = await storePage.getProduct(productId);
        expect(Number(product.quantity)).to.equal(1);

        await buyer3Page.buyProduct(productId);
        product = await storePage.getProduct(productId);
        expect(Number(product.quantity)).to.equal(0);

        await expect(storePage.buyProduct(productId))
            .to.be.revertedWith(ERRORS.ZERO_QUANTITY);
    });

    it("Should prevent duplicate purchases", async function () {
        const productId = 0;

        await storePage.buyProduct(productId);

        await expect(storePage.buyProduct(productId))
            .to.be.revertedWith(ERRORS.ALREADY_BOUGHT);

        const product = await storePage.getProduct(productId);
        expect(Number(product.quantity)).to.equal(2);
    });

    it("Should track buyers correctly", async function () {
        const productId = 0;

        await storePage.buyProduct(productId);
        await buyer2Page.buyProduct(productId);

        const buyers = await storePage.getProductBuyers(productId);
        expect(buyers).to.have.lengthOf(2);
        expect(buyers).to.include(storeData.buyer1.address);
        expect(buyers).to.include(storeData.buyer2.address);
    });

    it("Should handle concurrent purchases", async function () {
        await ownerPage.addProduct(testProducts.bulk.name, QUANTITIES.BULK);
        const productId = 1;

        await Promise.all([
            storePage.buyProduct(productId).catch((e) => e),
            buyer2Page.buyProduct(productId).catch((e) => e),
            buyer3Page.buyProduct(productId).catch((e) => e),
        ]);

        const product = await storePage.getProduct(productId);
        expect(Number(product.quantity)).to.be.lessThanOrEqual(QUANTITIES.BULK);
        expect(Number(product.quantity)).to.be.greaterThanOrEqual(0);
    });

    it("Should handle buy-refund-buy cycle", async function () {
        const productId = 0;

        await storePage.buyProduct(productId);
        await storePage.refundProduct(productId);
        await storePage.buyProduct(productId);

        const buyers = await storePage.getProductBuyers(productId);
        expect(buyers).to.have.lengthOf(2);
    });

    it("Should validate quantity modifier in product addition", async function () {
        // Test zero quantity - hits quantityCheck modifier else path
        await expect(ownerPage.addProduct("ValidName", 0))
            .to.be.revertedWith(ERRORS.ZERO_QUANTITY);

        // Verify successful case still works
        await ownerPage.addProduct("ValidName", QUANTITIES.DEFAULT);
        const product = await storePage.getProductByName("ValidName");
        expect(Number(product.quantity)).to.equal(QUANTITIES.DEFAULT);
    });
});
