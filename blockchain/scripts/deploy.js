const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting TrustChain Smart Contract Deployment...\n");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("📋 Deployment Details:");
  console.log("- Network:", network.name, `(Chain ID: ${network.chainId})`);
  console.log("- Deployer Address:", deployer.address);
  console.log("- Deployer Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log();

  // Deploy TrustChainSupplyChain contract
  console.log("📦 Deploying TrustChainSupplyChain contract...");
  const TrustChainSupplyChain = await ethers.getContractFactory("TrustChainSupplyChain");
  const supplyChain = await TrustChainSupplyChain.deploy();
  await supplyChain.waitForDeployment();
  
  const supplyChainAddress = await supplyChain.getAddress();
  console.log("✅ TrustChainSupplyChain deployed to:", supplyChainAddress);
  
  // Deploy TrustChainAuthenticityNFT contract
  console.log("🎨 Deploying TrustChainAuthenticityNFT contract...");
  const TrustChainAuthenticityNFT = await ethers.getContractFactory("TrustChainAuthenticityNFT");
  const authenticityNFT = await TrustChainAuthenticityNFT.deploy();
  await authenticityNFT.waitForDeployment();
  
  const authenticityNFTAddress = await authenticityNFT.getAddress();
  console.log("✅ TrustChainAuthenticityNFT deployed to:", authenticityNFTAddress);
  
  // Setup initial roles and permissions
  console.log("\n🔐 Setting up roles and permissions...");
  
  // Grant roles to deployer (for testing)
  await supplyChain.grantUserRole(await supplyChain.SUPPLIER_ROLE(), deployer.address);
  await supplyChain.grantUserRole(await supplyChain.DISTRIBUTOR_ROLE(), deployer.address);
  await supplyChain.grantUserRole(await supplyChain.RETAILER_ROLE(), deployer.address);
  await supplyChain.grantUserRole(await supplyChain.AUDITOR_ROLE(), deployer.address);
  
  await authenticityNFT.grantRole(await authenticityNFT.MINTER_ROLE(), deployer.address);
  await authenticityNFT.grantRole(await authenticityNFT.VERIFIER_ROLE(), deployer.address);
  
  console.log("✅ Roles granted to deployer for testing");
  
  // Grant NFT contract permission to mint from supply chain contract
  await authenticityNFT.grantRole(await authenticityNFT.MINTER_ROLE(), supplyChainAddress);
  console.log("✅ Supply chain contract granted minter role on NFT contract");
  
  // Save deployment information
  const deploymentInfo = {
    network: {
      name: network.name,
      chainId: Number(network.chainId),
    },
    deployer: deployer.address,
    contracts: {
      TrustChainSupplyChain: {
        address: supplyChainAddress,
        abi: "TrustChainSupplyChain.sol/TrustChainSupplyChain.json"
      },
      TrustChainAuthenticityNFT: {
        address: authenticityNFTAddress,
        abi: "TrustChainAuthenticityNFT.sol/TrustChainAuthenticityNFT.json"
      }
    },
    roles: {
      ADMIN_ROLE: await supplyChain.ADMIN_ROLE(),
      SUPPLIER_ROLE: await supplyChain.SUPPLIER_ROLE(),
      DISTRIBUTOR_ROLE: await supplyChain.DISTRIBUTOR_ROLE(),
      RETAILER_ROLE: await supplyChain.RETAILER_ROLE(),
      AUDITOR_ROLE: await supplyChain.AUDITOR_ROLE(),
      MINTER_ROLE: await authenticityNFT.MINTER_ROLE(),
      VERIFIER_ROLE: await authenticityNFT.VERIFIER_ROLE()
    },
    deployedAt: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };
  
  // Write deployment info to file
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentsDir, `${network.name}-deployment.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`\n📄 Deployment info saved to: ${deploymentFile}`);
  
  // Create sample products and transactions for testing
  if (network.chainId === 31337n || network.chainId === 80001n) { // localhost or mumbai
    console.log("\n🧪 Creating sample data for testing...");
    await createSampleData(supplyChain, authenticityNFT, deployer);
  }
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Contract Addresses:");
  console.log("- TrustChainSupplyChain:", supplyChainAddress);
  console.log("- TrustChainAuthenticityNFT:", authenticityNFTAddress);
  
  if (network.chainId !== 31337n) {
    console.log("\n⚡ To verify contracts on Etherscan/Polygonscan, run:");
    console.log(`npx hardhat verify --network ${network.name} ${supplyChainAddress}`);
    console.log(`npx hardhat verify --network ${network.name} ${authenticityNFTAddress}`);
  }
  
  console.log("\n🔗 Add these addresses to your frontend .env file:");
  console.log(`REACT_APP_CONTRACT_ADDRESS_SUPPLY_CHAIN=${supplyChainAddress}`);
  console.log(`REACT_APP_CONTRACT_ADDRESS_AUTHENTICITY_NFT=${authenticityNFTAddress}`);
  console.log(`REACT_APP_NETWORK_ID=${network.chainId}`);
}

async function createSampleData(supplyChain, authenticityNFT, deployer) {
  try {
    // Create sample products
    console.log("Creating sample products...");
    
    const products = [
      {
        name: "Smart Phone XYZ",
        description: "High-end smartphone with advanced features",
        category: 0, // Electronics
        price: ethers.parseEther("0.5"),
        ipfsHash: "QmSampleHash1Electronics"
      },
      {
        name: "Organic Coffee Beans",
        description: "Premium organic coffee from Ethiopia",
        category: 1, // Food
        price: ethers.parseEther("0.1"),
        ipfsHash: "QmSampleHash2Food"
      },
      {
        name: "Cotton T-Shirt",
        description: "100% organic cotton t-shirt",
        category: 2, // Textiles
        price: ethers.parseEther("0.05"),
        ipfsHash: "QmSampleHash3Textiles"
      }
    ];
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const tx = await supplyChain.createProduct(
        product.name,
        product.description,
        product.category,
        product.price,
        product.ipfsHash
      );
      await tx.wait();
      
      // Mint authenticity NFT for each product
      const productId = i + 1;
      const nftTx = await authenticityNFT.mintAuthenticityNFT(
        deployer.address,
        productId,
        Math.floor(Date.now() / 1000) - 86400, // 1 day ago
        `BATCH-${productId}-${Date.now()}`,
        `ipfs://QmNFTMetadata${productId}`
      );
      await nftTx.wait();
      
      console.log(`✅ Created product ${productId}: ${product.name}`);
    }
    
    // Create sample transaction
    console.log("Creating sample transaction...");
    const createTxn = await supplyChain.createTransaction(
      1, // Product ID
      deployer.address, // Receiver (same as sender for demo)
      2, // Quantity
      `TRK-${Date.now()}`, // Tracking number
      "QmSampleTransactionDoc", // IPFS document hash
      { value: ethers.parseEther("1.0") } // Payment
    );
    await createTxn.wait();
    
    console.log("✅ Sample transaction created");
    console.log("✅ Sample data creation completed");
    
  } catch (error) {
    console.log("⚠️  Error creating sample data:", error.message);
  }
}

// Handle errors
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
