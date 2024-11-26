// const { expect } = require("chai");
// const StoreFactory = require("./factories/StoreFactory");
// const ContractHelper = require("./helpers/ContractHelper");
// const StorePage = require("./pages/StorePage");
//
// //------------------------------------------------------------------------------
// // Store Contract Test Suite
// //------------------------------------------------------------------------------
// describe("Store Contract", function () {
//   let storePage;
//   let ownerPage;
//   let buyer2Page;
//   let buyer3Page;
//   let storeData;
//
//   beforeEach(async function () {
//     // ARRANGE - Deploy contract and set up test accounts
//     storeData = await StoreFactory.deploy();
//     ownerPage = new StorePage(storeData.contract, storeData.owner);
//     storePage = new StorePage(storeData.contract, storeData.buyer1);
//     buyer2Page = new StorePage(storeData.contract, storeData.buyer2);
//     buyer3Page = new StorePage(storeData.contract, storeData.buyer3);
//   });
//
//   //--------------------------------------------------------------------------
//   // Product Management - Admin Functions
//   //--------------------------------------------------------------------------
//   describe("Product Management - Admin Functions", function () {
//     it("Should allow owner to add multiple products", async function () {
//       // ARRANGE
//       const products = StoreFactory.createMultipleProducts(3);
//
//       // ACT
//       for (const product of products) {
//         await ownerPage.addProduct(product.name, product.quantity);
//       }
//
//       // ASSERT
//       const savedProducts = await storePage.getAllProducts();
//       expect(savedProducts.length).to.equal(3);
//
//       products.forEach((product, index) => {
//         expect(savedProducts[index].name).to.equal(product.name);
//         expect(Number(savedProducts[index].quantity)).to.equal(
//           product.quantity,
//         );
//       });
//     });
//
//     it("Should properly handle quantity updates for existing products", async function () {
//       // ARRANGE
//       const product = StoreFactory.createProductData();
//       await ownerPage.addProduct(product.name, product.quantity);
//       const productId = 0;
//
//       // ACT & ASSERT - Update via addProduct
//       await ownerPage.addProduct(product.name, 10);
//       let savedProduct = await storePage.getProductByName(product.name);
//       expect(Number(savedProduct.quantity)).to.equal(10);
//
//       // ACT & ASSERT - Update via updateProductQuantity
//       await ownerPage.updateProductQuantity(productId, 15);
//       savedProduct = await storePage.getProductByName(product.name);
//       expect(Number(savedProduct.quantity)).to.equal(15);
//     });
//
//     it("Should not allow non-owners to add or update products", async function () {
//       // ARRANGE
//       const product = StoreFactory.createProductData();
//
//       // ASSERT - Adding product
//       await expect(
//         storePage.addProduct(product.name, product.quantity),
//       ).to.be.revertedWith("Ownable: caller is not the owner");
//
//       // ARRANGE - Add product as owner
//       await ownerPage.addProduct(product.name, product.quantity);
//       const productId = 0;
//
//       // ASSERT - Updating product
//       await expect(
//         storePage.updateProductQuantity(productId, 10),
//       ).to.be.revertedWith("Ownable: caller is not the owner");
//     });
//
//     it("Should validate product name and quantity", async function () {
//       // ASSERT - Empty name validation
//       await expect(ownerPage.addProduct("", 5)).to.be.revertedWith(
//         "You have to enter a name!",
//       );
//
//       // ASSERT - Zero quantity validation
//       await expect(ownerPage.addProduct("Product1", 0)).to.be.revertedWith(
//         "Quantity can't be 0!",
//       );
//     });
//
//     it("Should update product map when adding and updating products", async function () {
//       // ARRANGE
//       const productName = "MapUpdateTest";
//       await ownerPage.addProduct(productName, 5);
//
//       // ACT & ASSERT - Initial add
//       let product = await storePage.getProductByName(productName);
//       expect(product.name).to.equal(productName);
//       expect(Number(product.quantity)).to.equal(5);
//
//       // ACT & ASSERT - Update existing
//       await ownerPage.addProduct(productName, 10);
//       product = await storePage.getProductByName(productName);
//       expect(Number(product.quantity)).to.equal(10);
//     });
//
//     it("Should handle empty product retrieval attempts", async function () {
//       // ASSERT - Empty string
//       await expect(storePage.getProductByName("")).to.be.revertedWith(
//         "You have to enter a name!",
//       );
//
//       // ASSERT - Non-existent product
//       await expect(
//         storePage.getProductByName("NonExistentProduct"),
//       ).to.be.revertedWith("This product does not exist!");
//     });
//
//     it("Should maintain product IDs consistently", async function () {
//       // ARRANGE
//       const productName1 = "Product1";
//       const productName2 = "Product2";
//
//       // ACT
//       await ownerPage.addProduct(productName1, 5);
//       await ownerPage.addProduct(productName2, 5);
//       await ownerPage.addProduct(productName1, 10); // Update first product
//
//       // ASSERT - Check IDs remained consistent
//       const products = await storePage.getAllProducts();
//       expect(products[0].name).to.equal(productName1);
//       expect(Number(products[0].quantity)).to.equal(10);
//     });
//   });
//
//   //--------------------------------------------------------------------------
//   // Product Purchasing - Complex Scenarios
//   //--------------------------------------------------------------------------
//   describe("Product Purchasing - Complex Scenarios", function () {
//     beforeEach(async function () {
//       await ownerPage.addProduct("Product1", 3);
//     });
//
//     it("Should handle multiple buyers and quantity tracking", async function () {
//       const productId = 0;
//
//       // ACT & ASSERT - First buyer
//       await storePage.buyProduct(productId);
//       let product = await storePage.getProduct(productId);
//       expect(Number(product.quantity)).to.equal(2);
//
//       // ACT & ASSERT - Second buyer
//       await buyer2Page.buyProduct(productId);
//       product = await storePage.getProduct(productId);
//       expect(Number(product.quantity)).to.equal(1);
//
//       // ACT & ASSERT - Third buyer
//       await buyer3Page.buyProduct(productId);
//       product = await storePage.getProduct(productId);
//       expect(Number(product.quantity)).to.equal(0);
//
//       // ASSERT - Should not allow more purchases
//       await expect(storePage.buyProduct(productId)).to.be.revertedWith(
//           "Quantity can't be 0!",
//       );
//     });
//
//     it("Should track buyers correctly", async function () {
//       const productId = 0;
//
//       // ACT - Two buyers purchase
//       await storePage.buyProduct(productId);
//       await buyer2Page.buyProduct(productId);
//
//       // ASSERT - Verify buyers list
//       const buyers = await storePage.getProductBuyers(productId);
//       expect(buyers).to.have.lengthOf(2);
//       expect(buyers).to.include(storeData.buyer1.address);
//       expect(buyers).to.include(storeData.buyer2.address);
//     });
//
//     it("Should handle buy-refund-buy cycle", async function () {
//       const productId = 0;
//
//       // ACT - Buy, refund, buy cycle
//       await storePage.buyProduct(productId);
//       await storePage.refundProduct(productId);
//       await storePage.buyProduct(productId);
//
//       // ASSERT
//       const buyers = await storePage.getProductBuyers(productId);
//       expect(buyers).to.have.lengthOf(2);
//     });
//
//     it("Should handle quantity updates after refund", async function () {
//       // ARRANGE
//       const productId = 0;
//       const initialQuantity = Number(
//           (await storePage.getProduct(productId)).quantity,
//       );
//
//       // ACT - Buy and refund
//       await storePage.buyProduct(productId);
//       await storePage.refundProduct(productId);
//
//       // ASSERT - Quantity should reflect the buy operation
//       const finalProduct = await storePage.getProduct(productId);
//       expect(Number(finalProduct.quantity)).to.equal(initialQuantity - 1);
//     });
//
//     it("Should handle multiple buyers with refunds", async function () {
//       // ARRANGE
//       await ownerPage.addProduct("BulkProduct", 10);
//       const productId = 1;
//       await ownerPage.setRefundPolicyNumber(200);
//
//       // First buyer cycle
//       await storePage.buyProduct(productId);
//       await storePage.refundProduct(productId);
//       await buyer2Page.buyProduct(productId);
//
//       // Second buyer cycle
//       await buyer2Page.refundProduct(productId);
//       await buyer3Page.buyProduct(productId);
//
//       const product = await storePage.getProduct(productId);
//       expect(Number(product.quantity)).to.equal(7); // 10 initial - 3 (one buy got refunded but still decrements)
//     });
//
//     // Add inside the "Product Purchasing - Complex Scenarios" section:
//     it("Should validate buying same product multiple times", async function () {
//       const productId = 0;
//
//       // First buy should succeed
//       await storePage.buyProduct(productId);
//
//       // Second buy should fail
//       await expect(storePage.buyProduct(productId))
//           .to.be.revertedWith("You cannot buy the same product more than once!");
//
//       // Verify state
//       const product = await storePage.getProduct(productId);
//       expect(Number(product.quantity)).to.equal(2);
//     });
//
// // Add inside "Edge Cases and Error Handling" section:
//     it("Should validate product existence across operations", async function () {
//       // ARRANGE
//       await ownerPage.addProduct("ExistenceTest", 2);
//       const productId = 1;
//
//       // Test refundProduct with non-existent product
//       await expect(storePage.refundProduct(999))
//           .to.be.revertedWith("This product does not exist!");
//
//       // Test updateQuantity with non-existent product
//       await expect(ownerPage.updateProductQuantity(999, 10))
//           .to.be.revertedWith("This product does not exist!");
//
//       // Test buyProduct - will panic due to quantityCheck modifier
//       await expect(storePage.buyProduct(999))
//           .to.be.revertedWithPanic(0x32);
//
//       // Verify operations on existing product still work
//       await storePage.buyProduct(productId);
//       await storePage.refundProduct(productId);
//       const product = await storePage.getProduct(productId);
//       expect(Number(product.quantity)).to.equal(1);
//     });
//   });
//
//   //--------------------------------------------------------------------------
//   // Refund Policy
//   //--------------------------------------------------------------------------
//   describe("Refund Policy", function () {
//     beforeEach(async function () {
//       await ownerPage.addProduct("Product1", 5);
//     });
//
//     it("Should handle multiple refunds within time limit", async function () {
//       const productId = 0;
//       const startQuantity = Number(
//           (await storePage.getProduct(productId)).quantity,
//       );
//
//       // ACT - First buyer cycle
//       await storePage.buyProduct(productId);
//       await storePage.refundProduct(productId);
//
//       // ACT - Second buyer cycle
//       await buyer2Page.buyProduct(productId);
//       await buyer2Page.refundProduct(productId);
//
//       // ASSERT
//       const finalQuantity = Number(
//           (await storePage.getProduct(productId)).quantity,
//       );
//       expect(finalQuantity).to.equal(startQuantity - 2);
//     });
//
//     it("Should emit correct events for buy and refund cycle", async function () {
//       const productId = 0;
//
//       // ASSERT - Buy event
//       await expect(storePage.buyProduct(productId))
//           .to.emit(storeData.contract, "ProductBought")
//           .withArgs(productId, storeData.buyer1.address);
//
//       // ASSERT - Refund event
//       await expect(storePage.refundProduct(productId))
//           .to.emit(storeData.contract, "ProductRefund")
//           .withArgs(productId);
//     });
//
//     it("Should enforce refund policy across multiple purchases", async function () {
//       // ARRANGE
//       const productId = 0;
//       await ownerPage.setRefundPolicyNumber(50);
//
//       // ACT & ASSERT - First purchase and refund
//       await storePage.buyProduct(productId);
//       await ContractHelper.mineBlocks(25);
//       await expect(storePage.refundProduct(productId)).not.to.be.reverted;
//
//       // ACT & ASSERT - Second purchase and refund attempt after policy period
//       await storePage.buyProduct(productId);
//       await ContractHelper.mineBlocks(51);
//       await expect(storePage.refundProduct(productId)).to.be.revertedWith(
//           "Sorry, your request for refund has been denied.",
//       );
//     });
//
//     it("Should handle refund policy updates correctly", async function () {
//       // ARRANGE
//       const productId = 0;
//       await storePage.buyProduct(productId);
//
//       // ACT - Change refund policy after purchase
//       await ownerPage.setRefundPolicyNumber(10);
//       await ContractHelper.mineBlocks(11);
//
//       // ASSERT - Should use policy from time of purchase
//       await expect(storePage.refundProduct(productId)).to.be.revertedWith(
//           "Sorry, your request for refund has been denied.",
//       );
//     });
//
//     it("Should correctly get and verify refund policy number", async function () {
//       // Default value check
//       let policyNumber = await storePage.getRefundPolicyNumber();
//       expect(Number(policyNumber)).to.equal(100);
//
//       // Update and verify
//       await ownerPage.setRefundPolicyNumber(50);
//       policyNumber = await storePage.getRefundPolicyNumber();
//       expect(Number(policyNumber)).to.equal(50);
//
//       // Edge values
//       await ownerPage.setRefundPolicyNumber(1);
//       policyNumber = await storePage.getRefundPolicyNumber();
//       expect(Number(policyNumber)).to.equal(1);
//
//       await ownerPage.setRefundPolicyNumber(255); // uint8 max
//       policyNumber = await storePage.getRefundPolicyNumber();
//       expect(Number(policyNumber)).to.equal(255);
//     });
//
//     it("Should handle refund when not bought but within timeframe", async function () {
//       // ARRANGE
//       await ownerPage.addProduct("RefundTest", 5);
//       const productId = 1;
//
//       // Set long refund window to pass first check
//       await ownerPage.setRefundPolicyNumber(200);
//
//       // Try to refund without buying
//       await expect(buyer2Page.refundProduct(productId)).to.be.revertedWith(
//           "You've already returned your product or didn't even bought it.",
//       );
//     });
//   });
//
//   //--------------------------------------------------------------------------
//   // Edge Cases and Error Handling
//   //--------------------------------------------------------------------------
//   describe("Edge Cases and Error Handling", function () {
//     beforeEach(async function () {
//       await ownerPage.addProduct("TestProduct", 5);
//     });
//
//     describe("Non-existent Product Handling", function () {
//       it("Should handle getProduct for non-existent ID", async function () {
//         await expect(storePage.getProduct(999)).to.be.revertedWith(
//             "This product does not exist!",
//         );
//       });
//
//       it("Should handle buyProduct for non-existent ID", async function () {
//         await expect(storePage.buyProduct(999)).to.be.revertedWithPanic(0x32);
//       });
//
//       it("Should handle getProductByName for non-existent product", async function () {
//         await expect(
//             storePage.getProductByName("NonExistentProduct"),
//         ).to.be.revertedWith("This product does not exist!");
//       });
//     });
//
//     describe("Product Name Handling", function () {
//       it("Should handle products with same name but different cases", async function () {
//         // ARRANGE & ACT
//         await ownerPage.addProduct("Product", 5);
//         await ownerPage.addProduct("PRODUCT", 10);
//         await ownerPage.addProduct("product", 15);
//
//         // ASSERT
//         const products = await storePage.getAllProducts();
//         const productNames = products.map((p) => p.name);
//         expect(
//             productNames.filter((name) => name.toLowerCase() === "product")
//                 .length,
//         ).to.equal(3);
//       });
//
//       it("Should handle products with special characters", async function () {
//         // ACT
//         await ownerPage.addProduct("Product#1", 5);
//         await ownerPage.addProduct("Product@2", 5);
//         await ownerPage.addProduct("Product$3", 5);
//
//         // ASSERT
//         const products = await storePage.getAllProducts();
//         expect(products.length).to.equal(4); // Including TestProduct from beforeEach
//       });
//
//       it("Should handle products with maximum name length", async function () {
//         // ARRANGE
//         const longName = "A".repeat(100);
//
//         // ACT
//         await ownerPage.addProduct(longName, 5);
//
//         // ASSERT
//         const product = await storePage.getProductByName(longName);
//         expect(product.name).to.equal(longName);
//       });
//     });
//
//     describe("Quantity Edge Cases", function () {
//       it("Should handle quantity at uint16 boundary", async function () {
//         // ARRANGE
//         const maxUint16 = 65535;
//
//         // ACT & ASSERT - Initial set
//         await ownerPage.addProduct("MaxProduct", maxUint16);
//         const product = await storePage.getProduct(1);
//         expect(Number(product.quantity)).to.equal(maxUint16);
//
//         // ACT & ASSERT - Update
//         await ownerPage.updateProductQuantity(1, maxUint16);
//         const updatedProduct = await storePage.getProduct(1);
//         expect(Number(updatedProduct.quantity)).to.equal(maxUint16);
//       });
//
//       it("Should handle multiple quantity decrements", async function () {
//         // ARRANGE
//         await ownerPage.addProduct("LowQuantityProduct", 2);
//         const productId = 1;
//
//         // ACT
//         await storePage.buyProduct(productId);
//         await buyer2Page.buyProduct(productId);
//
//         // ASSERT
//         const product = await storePage.getProduct(productId);
//         expect(Number(product.quantity)).to.equal(0);
//
//         await expect(buyer3Page.buyProduct(productId)).to.be.revertedWith(
//             "Quantity can't be 0!",
//         );
//       });
//     });
//
//     describe("Complex Buyer Scenarios", function () {
//       it("Should handle rapid sequential purchases", async function () {
//         // ARRANGE
//         await ownerPage.addProduct("PopularProduct", 3);
//         const productId = 1;
//
//         // ACT
//         await Promise.all([
//           storePage.buyProduct(productId).catch((e) => e),
//           buyer2Page.buyProduct(productId).catch((e) => e),
//           buyer3Page.buyProduct(productId).catch((e) => e),
//         ]);
//
//         // ASSERT
//         const product = await storePage.getProduct(productId);
//         expect(Number(product.quantity)).to.be.lessThanOrEqual(3);
//         expect(Number(product.quantity)).to.be.greaterThanOrEqual(0);
//       });
//
//       it("Should handle buy-refund-buy cycle at quantity boundaries", async function () {
//         // ARRANGE
//         await ownerPage.addProduct("CycleProduct", 2);
//         const productId = 1;
//
//         // ACT
//         await storePage.buyProduct(productId);
//         await buyer2Page.buyProduct(productId);
//         await storePage.refundProduct(productId);
//
//         // ASSERT
//         await expect(buyer3Page.buyProduct(productId)).to.be.revertedWith(
//             "Quantity can't be 0!",
//         );
//
//         const product = await storePage.getProduct(productId);
//         expect(Number(product.quantity)).to.equal(0);
//       });
//     });
//
//     describe("Product Access and Ownership Validations", function () {
//       beforeEach(async function () {
//         await ownerPage.addProduct("ValidationTest", 5);
//       });
//
//       it("Should enforce product existence and state rules for purchases", async function () {
//         // ARRANGE - Add a new product for this test
//         const startingQuantity = 2;
//         await ownerPage.addProduct("PurchaseTest", startingQuantity);
//         const productId = (await storePage.getAllProducts()).length - 1;
//
//         // Buy all available quantity
//         await storePage.buyProduct(productId);
//         await buyer2Page.buyProduct(productId);
//
//         // Try buying non-existent product - will panic due to array access in quantityCheck
//         await expect(storePage.buyProduct(999)).to.be.revertedWithPanic(0x32);
//
//         // Verify original purchases succeeded
//         const product = await storePage.getProduct(productId);
//         expect(Number(product.quantity)).to.equal(0);
//
//         const buyers = await storePage.getProductBuyers(productId);
//         expect(buyers).to.have.lengthOf(2);
//       });
//
//       it("Should maintain refund policy integrity and access control", async function () {
//         // Test non-owner access
//         await expect(storePage.setRefundPolicyNumber(50)).to.be.revertedWith(
//             "Ownable: caller is not the owner",
//         );
//
//         // Owner updates policy
//         await ownerPage.setRefundPolicyNumber(30);
//
//         // Buy and attempt refund with new policy
//         await storePage.buyProduct(0);
//         await ContractHelper.mineBlocks(31);
//
//         await expect(storePage.refundProduct(0)).to.be.revertedWith(
//             "Sorry, your request for refund has been denied.",
//         );
//
//         // Verify policy was updated only by owner
//         const newPolicy = await storePage.getRefundPolicyNumber();
//         expect(Number(newPolicy)).to.equal(30);
//       });
//
//       it("Should enforce product existence for buyer history access", async function () {
//         // ARRANGE - Set up purchase history
//         await storePage.buyProduct(0);
//         await buyer2Page.buyProduct(0);
//
//         // Test non-existent product buyers query
//         await expect(storePage.getProductBuyers(999)).to.be.revertedWith(
//             "This product does not exist!",
//         );
//
//         // Verify existing product buyers are intact
//         const buyers = await storePage.getProductBuyers(0);
//         expect(buyers).to.have.lengthOf(2);
//         expect(buyers).to.include(storeData.buyer1.address);
//         expect(buyers).to.include(storeData.buyer2.address);
//
//         // Verify full product state
//         const product = await storePage.getProduct(0);
//         expect(Number(product.quantity)).to.equal(3); // Started with 5, 2 purchases
//       });
//     });
//   });
// });
