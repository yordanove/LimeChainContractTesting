const { expect } = require("chai");
const { QUANTITIES } = require("../constants/productData");
const { ERRORS } = require("../constants/errorMessages");
const testProducts = require("../fixtures/testProducts.json");
const StoreFactory = require("../factories/StoreFactory");
const StorePage = require("../pages/StorePage");

describe("Product Management", function () {
    let storePage;
    let ownerPage;
    let storeData;

    beforeEach(async function () {
        storeData = await StoreFactory.deploy();
        ownerPage = new StorePage(storeData.contract, storeData.owner);
        storePage = new StorePage(storeData.contract, storeData.buyer1);
    });

    it("Should manage products with name validation", async function () {
        // Test empty name - hits nameCheck modifier
        await expect(ownerPage.addProduct("", QUANTITIES.DEFAULT))
            .to.be.revertedWith(ERRORS.EMPTY_NAME);

        // Test valid product name path
        const product = await ownerPage.addProduct("ValidProduct", QUANTITIES.DEFAULT);
        expect(product).not.to.be.reverted;

        // Test getProductByName validation
        await expect(storePage.getProductByName(""))
            .to.be.revertedWith(ERRORS.EMPTY_NAME);

        const savedProduct = await storePage.getProductByName("ValidProduct");
        expect(savedProduct.name).to.equal("ValidProduct");
    });

    it("Should properly validate product existence", async function () {
        await ownerPage.addProduct("TestProduct", QUANTITIES.DEFAULT);

        // Test non-existent product
        await expect(storePage.getProductByName("NonExistent"))
            .to.be.revertedWith(ERRORS.PRODUCT_NOT_EXISTS);

        // Test buyer list for non-existent product
        await expect(storePage.getProductBuyers(999))
            .to.be.revertedWith(ERRORS.PRODUCT_NOT_EXISTS);

        // Test valid product buyers retrieval
        const buyers = await storePage.getProductBuyers(0);
        expect(Array.isArray(buyers)).to.be.true;
    });

    it("Should enforce owner access control", async function () {
        const product = StoreFactory.createProductData();

        await expect(
            storePage.addProduct(product.name, product.quantity)
        ).to.be.revertedWith(ERRORS.NOT_OWNER);

        await ownerPage.addProduct(product.name, product.quantity);

        await expect(
            storePage.updateProductQuantity(0, QUANTITIES.HIGH)
        ).to.be.revertedWith(ERRORS.NOT_OWNER);
    });

    it("Should handle multiple products management", async function () {
        const products = StoreFactory.createMultipleProducts(3);

        for (const product of products) {
            await ownerPage.addProduct(product.name, product.quantity);
        }

        const savedProducts = await storePage.getAllProducts();
        expect(savedProducts.length).to.equal(3);

        products.forEach((product, index) => {
            expect(savedProducts[index].name).to.equal(product.name);
            expect(Number(savedProducts[index].quantity)).to.equal(product.quantity);
        });
    });

    it("Should update product quantities correctly", async function () {
        const product = StoreFactory.createProductData();
        await ownerPage.addProduct(product.name, product.quantity);

        await ownerPage.updateProductQuantity(0, QUANTITIES.HIGH);
        const savedProduct = await storePage.getProductByName(product.name);
        expect(Number(savedProduct.quantity)).to.equal(QUANTITIES.HIGH);
    });

    it("Should maintain consistent product mapping", async function () {
        const productName = "MapTest";
        await ownerPage.addProduct(productName, QUANTITIES.DEFAULT);

        let product = await storePage.getProductByName(productName);
        expect(product.name).to.equal(productName);

        await ownerPage.addProduct(productName, QUANTITIES.HIGH);
        product = await storePage.getProductByName(productName);
        expect(Number(product.quantity)).to.equal(QUANTITIES.HIGH);
    });
});
