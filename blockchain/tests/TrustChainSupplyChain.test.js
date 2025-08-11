const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TrustChainSupplyChain", function () {
  let supplyChain;
  let authenticityNFT;
  let owner;
  let supplier;
  let distributor;
  let retailer;
  let auditor;
  let user;
  
  const productData = {
    name: "Test Product",
    description: "A test product for supply chain",
    category: 0, // Electronics
    price: ethers.parseEther("1.0"),
    ipfsHash: "QmTestHash123"
  };
  
  beforeEach(async function () {
    [owner, supplier, distributor, retailer, auditor, user] = await ethers.getSigners();
    
    // Deploy contracts
    const TrustChainSupplyChain = await ethers.getContractFactory("TrustChainSupplyChain");
    supplyChain = await TrustChainSupplyChain.deploy();
    await supplyChain.waitForDeployment();
    
    const TrustChainAuthenticityNFT = await ethers.getContractFactory("TrustChainAuthenticityNFT");
    authenticityNFT = await TrustChainAuthenticityNFT.deploy();
    await authenticityNFT.waitForDeployment();
    
    // Grant roles
    await supplyChain.grantUserRole(await supplyChain.SUPPLIER_ROLE(), supplier.address);
    await supplyChain.grantUserRole(await supplyChain.DISTRIBUTOR_ROLE(), distributor.address);
    await supplyChain.grantUserRole(await supplyChain.RETAILER_ROLE(), retailer.address);
    await supplyChain.grantUserRole(await supplyChain.AUDITOR_ROLE(), auditor.address);
  });
  
  describe("Deployment", function () {
    it("Should deploy with correct initial state", async function () {
      expect(await supplyChain.getTotalProducts()).to.equal(0);
      expect(await supplyChain.getTotalTransactions()).to.equal(0);
      expect(await supplyChain.hasRole(await supplyChain.ADMIN_ROLE(), owner.address)).to.be.true;
    });
    
    it("Should have correct roles assigned", async function () {
      expect(await supplyChain.hasRole(await supplyChain.SUPPLIER_ROLE(), supplier.address)).to.be.true;
      expect(await supplyChain.hasRole(await supplyChain.DISTRIBUTOR_ROLE(), distributor.address)).to.be.true;
      expect(await supplyChain.hasRole(await supplyChain.RETAILER_ROLE(), retailer.address)).to.be.true;
      expect(await supplyChain.hasRole(await supplyChain.AUDITOR_ROLE(), auditor.address)).to.be.true;
    });
  });
  
  describe("Product Creation", function () {
    it("Should allow suppliers to create products", async function () {
      const tx = await supplyChain.connect(supplier).createProduct(
        productData.name,
        productData.description,
        productData.category,
        productData.price,
        productData.ipfsHash
      );
      
      await expect(tx)
        .to.emit(supplyChain, "ProductCreated")
        .withArgs(1, productData.name, supplier.address);
      
      const product = await supplyChain.products(1);
      expect(product.name).to.equal(productData.name);
      expect(product.price).to.equal(productData.price);
      expect(product.manufacturer).to.equal(supplier.address);
      expect(product.isActive).to.be.true;
      
      expect(await supplyChain.getTotalProducts()).to.equal(1);
    });
    
    it("Should not allow non-suppliers to create products", async function () {
      await expect(
        supplyChain.connect(user).createProduct(
          productData.name,
          productData.description,
          productData.category,
          productData.price,
          productData.ipfsHash
        )
      ).to.be.revertedWith("Only suppliers or admins can create products");
    });
    
    it("Should not allow empty product name", async function () {
      await expect(
        supplyChain.connect(supplier).createProduct(
          "",
          productData.description,
          productData.category,
          productData.price,
          productData.ipfsHash
        )
      ).to.be.revertedWith("Product name cannot be empty");
    });
    
    it("Should not allow zero price", async function () {
      await expect(
        supplyChain.connect(supplier).createProduct(
          productData.name,
          productData.description,
          productData.category,
          0,
          productData.ipfsHash
        )
      ).to.be.revertedWith("Product price must be greater than 0");
    });
  });
  
  describe("Transaction Creation", function () {
    beforeEach(async function () {
      // Create a product first
      await supplyChain.connect(supplier).createProduct(
        productData.name,
        productData.description,
        productData.category,
        productData.price,
        productData.ipfsHash
      );
    });
    
    it("Should allow creating transactions with sufficient payment", async function () {
      const quantity = 2;
      const totalAmount = productData.price * BigInt(quantity);
      const trackingNumber = "TRK-123456";
      
      const tx = await supplyChain.connect(supplier).createTransaction(
        1, // Product ID
        distributor.address,
        quantity,
        trackingNumber,
        "QmDocumentHash",
        { value: totalAmount }
      );
      
      await expect(tx)
        .to.emit(supplyChain, "TransactionCreated")
        .withArgs(1, 1, supplier.address, distributor.address);
      
      const transaction = await supplyChain.transactions(1);
      expect(transaction.productId).to.equal(1);
      expect(transaction.sender).to.equal(supplier.address);
      expect(transaction.receiver).to.equal(distributor.address);
      expect(transaction.quantity).to.equal(quantity);
      expect(transaction.amount).to.equal(totalAmount);
      expect(transaction.status).to.equal(0); // Pending
      
      expect(await supplyChain.getTotalTransactions()).to.equal(1);
    });
    
    it("Should not allow insufficient payment", async function () {
      const quantity = 2;
      const insufficientAmount = productData.price; // Should be price * quantity
      
      await expect(
        supplyChain.connect(supplier).createTransaction(
          1,
          distributor.address,
          2,
          "TRK-123456",
          "QmDocumentHash",
          { value: insufficientAmount }
        )
      ).to.be.revertedWith("Insufficient payment");
    });
    
    it("Should not allow transactions to non-role addresses", async function () {
      await expect(
        supplyChain.connect(supplier).createTransaction(
          1,
          user.address, // User has no role
          1,
          "TRK-123456",
          "QmDocumentHash",
          { value: productData.price }
        )
      ).to.be.revertedWith("Receiver must have appropriate role");
    });
    
    it("Should not allow duplicate tracking numbers", async function () {
      const trackingNumber = "TRK-123456";
      
      // First transaction
      await supplyChain.connect(supplier).createTransaction(
        1,
        distributor.address,
        1,
        trackingNumber,
        "QmDocumentHash",
        { value: productData.price }
      );
      
      // Second transaction with same tracking number
      await expect(
        supplyChain.connect(supplier).createTransaction(
          1,
          distributor.address,
          1,
          trackingNumber,
          "QmDocumentHash2",
          { value: productData.price }
        )
      ).to.be.revertedWith("Tracking number already exists");
    });
    
    it("Should refund excess payment", async function () {
      const excessPayment = productData.price + ethers.parseEther("0.5");
      const supplierBalanceBefore = await ethers.provider.getBalance(supplier.address);
      
      const tx = await supplyChain.connect(supplier).createTransaction(
        1,
        distributor.address,
        1,
        "TRK-123456",
        "QmDocumentHash",
        { value: excessPayment }
      );
      
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const supplierBalanceAfter = await ethers.provider.getBalance(supplier.address);
      const expectedBalance = supplierBalanceBefore - productData.price - gasUsed;
      
      expect(supplierBalanceAfter).to.be.closeTo(expectedBalance, ethers.parseEther("0.001"));
    });
  });
  
  describe("Transaction Status Updates", function () {
    beforeEach(async function () {
      // Create product and transaction
      await supplyChain.connect(supplier).createProduct(
        productData.name,
        productData.description,
        productData.category,
        productData.price,
        productData.ipfsHash
      );
      
      await supplyChain.connect(supplier).createTransaction(
        1,
        distributor.address,
        1,
        "TRK-123456",
        "QmDocumentHash",
        { value: productData.price }
      );
    });
    
    it("Should allow valid status transitions", async function () {
      // Pending -> InTransit
      const tx1 = await supplyChain.connect(distributor).updateTransactionStatus(
        1,
        1, // InTransit
        "Warehouse A"
      );
      
      await expect(tx1)
        .to.emit(supplyChain, "TransactionStatusUpdated")
        .withArgs(1, 1, distributor.address);
      
      // InTransit -> Delivered
      const tx2 = await supplyChain.connect(distributor).updateTransactionStatus(
        1,
        2, // Delivered
        "Customer Location"
      );
      
      await expect(tx2)
        .to.emit(supplyChain, "TransactionStatusUpdated")
        .withArgs(1, 2, distributor.address);
      
      const transaction = await supplyChain.transactions(1);
      expect(transaction.status).to.equal(2); // Delivered
      expect(transaction.location).to.equal("Customer Location");
    });
    
    it("Should not allow invalid status transitions", async function () {
      // Try to go from Pending directly to Delivered
      await expect(
        supplyChain.connect(distributor).updateTransactionStatus(
          1,
          2, // Delivered
          "Location"
        )
      ).to.be.revertedWith("Invalid status transition");
    });
    
    it("Should not allow unauthorized users to update status", async function () {
      await expect(
        supplyChain.connect(user).updateTransactionStatus(
          1,
          1, // InTransit
          "Location"
        )
      ).to.be.revertedWith("Not authorized to update this transaction");
    });
  });
  
  describe("Product Verification", function () {
    beforeEach(async function () {
      // Create product, transaction, and deliver it
      await supplyChain.connect(supplier).createProduct(
        productData.name,
        productData.description,
        productData.category,
        productData.price,
        productData.ipfsHash
      );
      
      await supplyChain.connect(supplier).createTransaction(
        1,
        distributor.address,
        1,
        "TRK-123456",
        "QmDocumentHash",
        { value: productData.price }
      );
      
      // Update to InTransit then Delivered
      await supplyChain.connect(distributor).updateTransactionStatus(1, 1, "Location");
      await supplyChain.connect(distributor).updateTransactionStatus(1, 2, "Final Location");
    });
    
    it("Should allow auditors to verify products", async function () {
      const qualityScore = 5;
      const notes = "Excellent quality";
      
      const tx = await supplyChain.connect(auditor).verifyProduct(
        1,
        qualityScore,
        notes
      );
      
      await expect(tx)
        .to.emit(supplyChain, "ProductVerified")
        .withArgs(1, auditor.address);
      
      const transaction = await supplyChain.transactions(1);
      expect(transaction.isCompliant).to.be.true;
      expect(transaction.qualityScore).to.equal(qualityScore);
      expect(transaction.status).to.equal(3); // Verified
    });
    
    it("Should not allow verification before delivery", async function () {
      // Create new transaction that's not delivered
      await supplyChain.connect(supplier).createTransaction(
        1,
        retailer.address,
        1,
        "TRK-789456",
        "QmDocumentHash2",
        { value: productData.price }
      );
      
      await expect(
        supplyChain.connect(auditor).verifyProduct(2, 5, "Notes")
      ).to.be.revertedWith("Product must be delivered before verification");
    });
    
    it("Should not allow non-auditors to verify", async function () {
      await expect(
        supplyChain.connect(user).verifyProduct(1, 5, "Notes")
      ).to.be.revertedWith("Only auditors or admins can verify products");
    });
    
    it("Should not allow invalid quality scores", async function () {
      await expect(
        supplyChain.connect(auditor).verifyProduct(1, 0, "Notes")
      ).to.be.revertedWith("Quality score must be between 1 and 5");
      
      await expect(
        supplyChain.connect(auditor).verifyProduct(1, 6, "Notes")
      ).to.be.revertedWith("Quality score must be between 1 and 5");
    });
  });
  
  describe("Tracking and Queries", function () {
    beforeEach(async function () {
      await supplyChain.connect(supplier).createProduct(
        productData.name,
        productData.description,
        productData.category,
        productData.price,
        productData.ipfsHash
      );
      
      await supplyChain.connect(supplier).createTransaction(
        1,
        distributor.address,
        1,
        "TRK-123456",
        "QmDocumentHash",
        { value: productData.price }
      );
    });
    
    it("Should find transaction by tracking number", async function () {
      const transaction = await supplyChain.getTransactionByTrackingNumber("TRK-123456");
      expect(transaction.id).to.equal(1);
      expect(transaction.trackingNumber).to.equal("TRK-123456");
    });
    
    it("Should return user transactions", async function () {
      const supplierTransactions = await supplyChain.getUserTransactions(supplier.address);
      const distributorTransactions = await supplyChain.getUserTransactions(distributor.address);
      
      expect(supplierTransactions.length).to.equal(1);
      expect(distributorTransactions.length).to.equal(1);
      expect(supplierTransactions[0]).to.equal(1);
      expect(distributorTransactions[0]).to.equal(1);
    });
    
    it("Should return audit logs", async function () {
      const auditLogs = await supplyChain.connect(supplier).getAuditLogs(1);
      expect(auditLogs.length).to.equal(1);
      expect(auditLogs[0].action).to.equal("Transaction Created");
      expect(auditLogs[0].auditor).to.equal(supplier.address);
    });
  });
  
  describe("Emergency Functions", function () {
    it("Should allow admin to pause contract", async function () {
      await supplyChain.connect(owner).emergencyPause();
      expect(await supplyChain.paused()).to.be.true;
    });
    
    it("Should not allow operations when paused", async function () {
      await supplyChain.connect(owner).emergencyPause();
      
      await expect(
        supplyChain.connect(supplier).createProduct(
          productData.name,
          productData.description,
          productData.category,
          productData.price,
          productData.ipfsHash
        )
      ).to.be.revertedWith("Pausable: paused");
    });
    
    it("Should allow admin to unpause contract", async function () {
      await supplyChain.connect(owner).emergencyPause();
      await supplyChain.connect(owner).emergencyUnpause();
      expect(await supplyChain.paused()).to.be.false;
    });
    
    it("Should not allow non-admin to pause", async function () {
      await expect(
        supplyChain.connect(user).emergencyPause()
      ).to.be.revertedWith(`AccessControl: account ${user.address.toLowerCase()} is missing role ${await supplyChain.ADMIN_ROLE()}`);
    });
  });
});
