// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title TrustChainSupplyChain
 * @dev Smart contract for managing supply chain transactions with role-based access control
 * @author AKbar - TrustChain Team
 */
contract TrustChainSupplyChain is AccessControl, ReentrancyGuard, Pausable {
    
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant SUPPLIER_ROLE = keccak256("SUPPLIER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    
    // Counters
    uint256 private _transactionIdCounter;
    uint256 private _productIdCounter;
    
    // Enums
    enum TransactionStatus { Pending, InTransit, Delivered, Verified, Cancelled }
    enum ProductCategory { Electronics, Food, Textiles, Automotive, Pharmaceutical, Other }
    
    // Structs
    struct Product {
        uint256 id;
        string name;
        string description;
        ProductCategory category;
        uint256 price;
        address manufacturer;
        string ipfsHash; // Metadata stored on IPFS
        bool isActive;
        uint256 createdAt;
    }
    
    struct Transaction {
        uint256 id;
        uint256 productId;
        address sender;
        address receiver;
        uint256 quantity;
        uint256 amount;
        TransactionStatus status;
        string trackingNumber;
        string location;
        uint256 createdAt;
        uint256 updatedAt;
        string ipfsDocumentHash; // Documents stored on IPFS
        bool isCompliant;
        uint256 qualityScore; // 1-5 rating
    }
    
    struct AuditLog {
        uint256 transactionId;
        address auditor;
        string action;
        uint256 timestamp;
        string notes;
    }
    
    // State variables
    mapping(uint256 => Product) public products;
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => AuditLog[]) public auditLogs;
    mapping(address => uint256[]) public userTransactions;
    mapping(string => uint256) public trackingNumberToTransaction;
    
    // Events
    event ProductCreated(uint256 indexed productId, string name, address indexed manufacturer);
    event TransactionCreated(uint256 indexed transactionId, uint256 indexed productId, address indexed sender, address receiver);
    event TransactionStatusUpdated(uint256 indexed transactionId, TransactionStatus status, address updatedBy);
    event ProductVerified(uint256 indexed productId, address indexed verifier);
    event AuditPerformed(uint256 indexed transactionId, address indexed auditor, string action);
    event EmergencyPause(address indexed admin);
    event EmergencyUnpause(address indexed admin);
    
    // Modifiers
    modifier onlyValidProduct(uint256 _productId) {
        require(products[_productId].isActive, "Product does not exist or is inactive");
        _;
    }
    
    modifier onlyValidTransaction(uint256 _transactionId) {
        require(_transactionId <= _transactionIdCounter, "Transaction does not exist");
        _;
    }
    
    modifier onlyTransactionParticipant(uint256 _transactionId) {
        Transaction memory txn = transactions[_transactionId];
        require(
            msg.sender == txn.sender || 
            msg.sender == txn.receiver || 
            hasRole(ADMIN_ROLE, msg.sender) ||
            hasRole(AUDITOR_ROLE, msg.sender),
            "Not authorized to access this transaction"
        );
        _;
    }
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
    }
    
    /**
     * @dev Create a new product in the supply chain
     * @param _name Product name
     * @param _description Product description
     * @param _category Product category
     * @param _price Product price in wei
     * @param _ipfsHash IPFS hash for metadata
     */
    function createProduct(
        string memory _name,
        string memory _description,
        ProductCategory _category,
        uint256 _price,
        string memory _ipfsHash
    ) external whenNotPaused returns (uint256) {
        require(
            hasRole(SUPPLIER_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender),
            "Only suppliers or admins can create products"
        );
        require(bytes(_name).length > 0, "Product name cannot be empty");
        require(_price > 0, "Product price must be greater than 0");
        
        _productIdCounter++;
        uint256 newProductId = _productIdCounter;
        
        products[newProductId] = Product({
            id: newProductId,
            name: _name,
            description: _description,
            category: _category,
            price: _price,
            manufacturer: msg.sender,
            ipfsHash: _ipfsHash,
            isActive: true,
            createdAt: block.timestamp
        });
        
        emit ProductCreated(newProductId, _name, msg.sender);
        return newProductId;
    }
    
    /**
     * @dev Create a new transaction
     * @param _productId Product ID
     * @param _receiver Receiver address
     * @param _quantity Quantity of products
     * @param _trackingNumber Tracking number for shipment
     * @param _ipfsDocumentHash IPFS hash for transaction documents
     */
    function createTransaction(
        uint256 _productId,
        address _receiver,
        uint256 _quantity,
        string memory _trackingNumber,
        string memory _ipfsDocumentHash
    ) external payable onlyValidProduct(_productId) whenNotPaused returns (uint256) {
        require(_receiver != address(0), "Invalid receiver address");
        require(_receiver != msg.sender, "Cannot send to yourself");
        require(_quantity > 0, "Quantity must be greater than 0");
        require(bytes(_trackingNumber).length > 0, "Tracking number cannot be empty");
        require(trackingNumberToTransaction[_trackingNumber] == 0, "Tracking number already exists");
        
        Product memory product = products[_productId];
        uint256 totalAmount = product.price * _quantity;
        require(msg.value >= totalAmount, "Insufficient payment");
        
        // Check if receiver has appropriate role
        require(
            hasRole(DISTRIBUTOR_ROLE, _receiver) || 
            hasRole(RETAILER_ROLE, _receiver) ||
            hasRole(SUPPLIER_ROLE, _receiver),
            "Receiver must have appropriate role"
        );
        
        _transactionIdCounter++;
        uint256 newTransactionId = _transactionIdCounter;
        
        transactions[newTransactionId] = Transaction({
            id: newTransactionId,
            productId: _productId,
            sender: msg.sender,
            receiver: _receiver,
            quantity: _quantity,
            amount: totalAmount,
            status: TransactionStatus.Pending,
            trackingNumber: _trackingNumber,
            location: "",
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            ipfsDocumentHash: _ipfsDocumentHash,
            isCompliant: false,
            qualityScore: 0
        });
        
        userTransactions[msg.sender].push(newTransactionId);
        userTransactions[_receiver].push(newTransactionId);
        trackingNumberToTransaction[_trackingNumber] = newTransactionId;
        
        // Add audit log
        _addAuditLog(newTransactionId, msg.sender, "Transaction Created", "");
        
        // Refund excess payment
        if (msg.value > totalAmount) {
            payable(msg.sender).transfer(msg.value - totalAmount);
        }
        
        emit TransactionCreated(newTransactionId, _productId, msg.sender, _receiver);
        return newTransactionId;
    }
    
    /**
     * @dev Update transaction status
     * @param _transactionId Transaction ID
     * @param _status New status
     * @param _location Current location (optional)
     */
    function updateTransactionStatus(
        uint256 _transactionId,
        TransactionStatus _status,
        string memory _location
    ) external onlyValidTransaction(_transactionId) whenNotPaused {
        Transaction storage txn = transactions[_transactionId];
        
        // Only sender, receiver, or admin can update status
        require(
            msg.sender == txn.sender || 
            msg.sender == txn.receiver || 
            hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized to update this transaction"
        );
        
        // Status transition validation
        require(_isValidStatusTransition(txn.status, _status), "Invalid status transition");
        
        TransactionStatus oldStatus = txn.status;
        txn.status = _status;
        txn.updatedAt = block.timestamp;
        
        if (bytes(_location).length > 0) {
            txn.location = _location;
        }
        
        // Add audit log
        string memory action = string(abi.encodePacked(
            "Status updated from ",
            _statusToString(oldStatus),
            " to ",
            _statusToString(_status)
        ));
        _addAuditLog(_transactionId, msg.sender, action, _location);
        
        // Auto-payment on delivery
        if (_status == TransactionStatus.Delivered && oldStatus != TransactionStatus.Delivered) {
            _processPayment(_transactionId);
        }
        
        emit TransactionStatusUpdated(_transactionId, _status, msg.sender);
    }
    
    /**
     * @dev Verify product and mark as compliant
     * @param _transactionId Transaction ID
     * @param _qualityScore Quality score (1-5)
     * @param _notes Verification notes
     */
    function verifyProduct(
        uint256 _transactionId,
        uint256 _qualityScore,
        string memory _notes
    ) external onlyValidTransaction(_transactionId) whenNotPaused {
        require(
            hasRole(AUDITOR_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender),
            "Only auditors or admins can verify products"
        );
        require(_qualityScore >= 1 && _qualityScore <= 5, "Quality score must be between 1 and 5");
        
        Transaction storage txn = transactions[_transactionId];
        require(txn.status == TransactionStatus.Delivered, "Product must be delivered before verification");
        
        txn.isCompliant = true;
        txn.qualityScore = _qualityScore;
        txn.status = TransactionStatus.Verified;
        txn.updatedAt = block.timestamp;
        
        _addAuditLog(_transactionId, msg.sender, "Product Verified", _notes);
        
        emit ProductVerified(txn.productId, msg.sender);
        emit TransactionStatusUpdated(_transactionId, TransactionStatus.Verified, msg.sender);
    }
    
    /**
     * @dev Get transaction by tracking number
     * @param _trackingNumber Tracking number
     */
    function getTransactionByTrackingNumber(string memory _trackingNumber) 
        external view returns (Transaction memory) {
        uint256 transactionId = trackingNumberToTransaction[_trackingNumber];
        require(transactionId > 0, "Transaction not found");
        return transactions[transactionId];
    }
    
    /**
     * @dev Get user's transactions
     * @param _user User address
     */
    function getUserTransactions(address _user) external view returns (uint256[] memory) {
        return userTransactions[_user];
    }
    
    /**
     * @dev Get audit logs for a transaction
     * @param _transactionId Transaction ID
     */
    function getAuditLogs(uint256 _transactionId) 
        external view onlyTransactionParticipant(_transactionId) returns (AuditLog[] memory) {
        return auditLogs[_transactionId];
    }
    
    /**
     * @dev Get total number of products
     */
    function getTotalProducts() external view returns (uint256) {
        return _productIdCounter;
    }
    
    /**
     * @dev Get total number of transactions
     */
    function getTotalTransactions() external view returns (uint256) {
        return _transactionIdCounter;
    }
    
    /**
     * @dev Emergency pause contract
     */
    function emergencyPause() external onlyRole(ADMIN_ROLE) {
        _pause();
        emit EmergencyPause(msg.sender);
    }
    
    /**
     * @dev Emergency unpause contract
     */
    function emergencyUnpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
        emit EmergencyUnpause(msg.sender);
    }
    
    /**
     * @dev Grant role to user
     * @param _role Role to grant
     * @param _user User address
     */
    function grantUserRole(bytes32 _role, address _user) external onlyRole(ADMIN_ROLE) {
        require(_user != address(0), "Invalid user address");
        _grantRole(_role, _user);
    }
    
    /**
     * @dev Revoke role from user
     * @param _role Role to revoke
     * @param _user User address
     */
    function revokeUserRole(bytes32 _role, address _user) external onlyRole(ADMIN_ROLE) {
        _revokeRole(_role, _user);
    }
    
    // Internal functions
    function _processPayment(uint256 _transactionId) internal nonReentrant {
        Transaction memory txn = transactions[_transactionId];
        require(txn.amount > 0, "No payment to process");
        
        // Transfer payment to receiver
        payable(txn.receiver).transfer(txn.amount);
        
        _addAuditLog(_transactionId, address(this), "Payment Processed", "");
    }
    
    function _addAuditLog(
        uint256 _transactionId,
        address _auditor,
        string memory _action,
        string memory _notes
    ) internal {
        auditLogs[_transactionId].push(AuditLog({
            transactionId: _transactionId,
            auditor: _auditor,
            action: _action,
            timestamp: block.timestamp,
            notes: _notes
        }));
        
        emit AuditPerformed(_transactionId, _auditor, _action);
    }
    
    function _isValidStatusTransition(TransactionStatus _from, TransactionStatus _to) 
        internal pure returns (bool) {
        if (_from == TransactionStatus.Pending) {
            return _to == TransactionStatus.InTransit || _to == TransactionStatus.Cancelled;
        } else if (_from == TransactionStatus.InTransit) {
            return _to == TransactionStatus.Delivered || _to == TransactionStatus.Cancelled;
        } else if (_from == TransactionStatus.Delivered) {
            return _to == TransactionStatus.Verified;
        }
        return false;
    }
    
    function _statusToString(TransactionStatus _status) internal pure returns (string memory) {
        if (_status == TransactionStatus.Pending) return "Pending";
        if (_status == TransactionStatus.InTransit) return "InTransit";
        if (_status == TransactionStatus.Delivered) return "Delivered";
        if (_status == TransactionStatus.Verified) return "Verified";
        if (_status == TransactionStatus.Cancelled) return "Cancelled";
        return "Unknown";
    }
    
    // Emergency functions
    function withdrawEmergency() external onlyRole(ADMIN_ROLE) {
        payable(msg.sender).transfer(address(this).balance);
    }
    
    receive() external payable {}
}
