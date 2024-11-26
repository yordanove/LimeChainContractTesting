class StorePage {
  constructor(contract, signer) {
    this.contract = contract;
    this.signer = signer;
  }

  async addProduct(name, quantity) {
    return await this.contract.connect(this.signer).addProduct(name, quantity);
  }

  async updateProductQuantity(id, quantity) {
    return await this.contract
      .connect(this.signer)
      .updateProductQuantity(id, quantity);
  }

  async buyProduct(id) {
    return await this.contract.connect(this.signer).buyProduct(id);
  }

  async refundProduct(id) {
    return await this.contract.connect(this.signer).refundProduct(id);
  }

  async getProduct(id) {
    return await this.contract.connect(this.signer).getProductById(id);
  }

  async getProductByName(name) {
    return await this.contract.connect(this.signer).getProductByName(name);
  }

  async getAllProducts() {
    return await this.contract.connect(this.signer).getAllProducts();
  }

  async getProductBuyers(id) {
    return await this.contract.connect(this.signer).getProductBuyersById(id);
  }

  async setRefundPolicyNumber(blocks) {
    return await this.contract
      .connect(this.signer)
      .setRefundPolicyNumber(blocks);
  }

  async getRefundPolicyNumber() {
    return await this.contract.connect(this.signer).getRefundPolicyNumber();
  }
}

module.exports = StorePage;
