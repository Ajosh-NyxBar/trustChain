// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title TrustChainAuthenticityNFT
 * @dev NFT contract for product authenticity certificates
 * @author AKbar - TrustChain Team
 */
contract TrustChainAuthenticityNFT is ERC721, ERC721URIStorage, AccessControl {
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    uint256 private _tokenIdCounter;
    
    struct AuthenticityData {
        uint256 productId;
        uint256 transactionId;
        address manufacturer;
        address currentOwner;
        uint256 manufacturingDate;
        uint256 verificationDate;
        string batchNumber;
        string qualityCertificates;
        bool isAuthentic;
        uint256 qualityScore;
    }
    
    mapping(uint256 => AuthenticityData) public authenticityData;
    mapping(uint256 => uint256) public productToNFT; // productId => tokenId
    mapping(string => uint256) public batchToNFT; // batchNumber => tokenId
    
    event AuthenticityNFTMinted(
        uint256 indexed tokenId,
        uint256 indexed productId,
        address indexed manufacturer,
        string batchNumber
    );
    
    event AuthenticityVerified(
        uint256 indexed tokenId,
        address indexed verifier,
        bool isAuthentic,
        uint256 qualityScore
    );
    
    event OwnershipTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 transactionId
    );
    
    constructor() ERC721("TrustChain Authenticity Certificate", "TCAC") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }
    
    /**
     * @dev Mint authenticity NFT for a product
     * @param _to Owner address
     * @param _productId Product ID from main contract
     * @param _manufacturingDate Manufacturing date
     * @param _batchNumber Batch number
     * @param _tokenURI IPFS URI for metadata
     */
    function mintAuthenticityNFT(
        address _to,
        uint256 _productId,
        uint256 _manufacturingDate,
        string memory _batchNumber,
        string memory _tokenURI
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(_to != address(0), "Cannot mint to zero address");
        require(productToNFT[_productId] == 0, "Product already has authenticity NFT");
        require(batchToNFT[_batchNumber] == 0, "Batch number already exists");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        _safeMint(_to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        authenticityData[tokenId] = AuthenticityData({
            productId: _productId,
            transactionId: 0,
            manufacturer: msg.sender,
            currentOwner: _to,
            manufacturingDate: _manufacturingDate,
            verificationDate: block.timestamp,
            batchNumber: _batchNumber,
            qualityCertificates: "",
            isAuthentic: true,
            qualityScore: 0
        });
        
        productToNFT[_productId] = tokenId;
        batchToNFT[_batchNumber] = tokenId;
        
        emit AuthenticityNFTMinted(tokenId, _productId, msg.sender, _batchNumber);
        return tokenId;
    }
    
    /**
     * @dev Verify authenticity and update quality data
     * @param _tokenId Token ID
     * @param _isAuthentic Authenticity status
     * @param _qualityScore Quality score (1-5)
     * @param _certificates Quality certificates hash
     */
    function verifyAuthenticity(
        uint256 _tokenId,
        bool _isAuthentic,
        uint256 _qualityScore,
        string memory _certificates
    ) external onlyRole(VERIFIER_ROLE) {
        require(_ownerOf(_tokenId) != address(0), "Token does not exist");
        require(_qualityScore >= 1 && _qualityScore <= 5, "Quality score must be between 1 and 5");
        
        AuthenticityData storage data = authenticityData[_tokenId];
        data.isAuthentic = _isAuthentic;
        data.qualityScore = _qualityScore;
        data.qualityCertificates = _certificates;
        data.verificationDate = block.timestamp;
        
        emit AuthenticityVerified(_tokenId, msg.sender, _isAuthentic, _qualityScore);
    }
    
    /**
     * @dev Transfer ownership during supply chain transaction
     * @param _tokenId Token ID
     * @param _to New owner
     * @param _transactionId Transaction ID from main contract
     */
    function transferOwnershipWithTransaction(
        uint256 _tokenId,
        address _to,
        uint256 _transactionId
    ) external {
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        require(_to != address(0), "Cannot transfer to zero address");
        
        AuthenticityData storage data = authenticityData[_tokenId];
        address from = data.currentOwner;
        data.currentOwner = _to;
        data.transactionId = _transactionId;
        
        _transfer(msg.sender, _to, _tokenId);
        
        emit OwnershipTransferred(_tokenId, from, _to, _transactionId);
    }
    
    /**
     * @dev Get authenticity data for a product
     * @param _productId Product ID
     */
    function getAuthenticityByProductId(uint256 _productId) 
        external view returns (AuthenticityData memory) {
        uint256 tokenId = productToNFT[_productId];
        require(tokenId > 0, "Product authenticity NFT not found");
        return authenticityData[tokenId];
    }
    
    /**
     * @dev Get authenticity data by batch number
     * @param _batchNumber Batch number
     */
    function getAuthenticityByBatch(string memory _batchNumber) 
        external view returns (AuthenticityData memory) {
        uint256 tokenId = batchToNFT[_batchNumber];
        require(tokenId > 0, "Batch authenticity NFT not found");
        return authenticityData[tokenId];
    }
    
    /**
     * @dev Check if product is authentic
     * @param _productId Product ID
     */
    function isProductAuthentic(uint256 _productId) external view returns (bool) {
        uint256 tokenId = productToNFT[_productId];
        if (tokenId == 0) return false;
        return authenticityData[tokenId].isAuthentic;
    }
    
    /**
     * @dev Get total minted tokens
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    // Override functions
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Update current owner in authenticity data
        if (to != address(0) && from != address(0)) {
            authenticityData[tokenId].currentOwner = to;
        }
        
        return super._update(to, tokenId, auth);
    }
    
    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
