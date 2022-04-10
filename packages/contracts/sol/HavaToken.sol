// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0;

import "./SafeMath.sol";
import "./IERC20.sol";
import "./EIP712.sol";
import "./ECDSA.sol";


contract HavaToken is IERC20, EIP712("HavaToken", "1.0.0") {
    using SafeMath for uint256;

    string public constant name = "HAVA";
    string public constant symbol = "HAVA";
    uint8 public constant decimals = 0;

    uint public constant costPerToken = 1000 gwei;

    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowances;
    mapping(uint256 => bool) nonces;

    struct Lock {
        uint timestamp;
        address router;
        uint256 nonce;
    }

    mapping(address => Lock) public locked;

    uint256 totalSupply_ = 0;

    modifier isUnlocked(address tokenHolder) {
        require(isUnlocked_(tokenHolder));
        _;
    }

    function isUnlocked_(address tokenHolder) internal view returns(bool) {
        return locked[tokenHolder].timestamp <= block.timestamp.add(60*60*24);
    }


    function buyToken() external payable {
        require(msg.value.mod(costPerToken) == 0);

        uint tokens = msg.value.div(costPerToken);

        totalSupply_ = totalSupply_.add(tokens);
        balances[msg.sender] = balances[msg.sender].add(tokens);

        emit Transfer(address(this), msg.sender, tokens);
    }

    function sellToken(uint256 amount) external isUnlocked(msg.sender) {
        require(balances[msg.sender] >= amount);
        
        uint weiToSend = amount.mul(costPerToken);

        balances[msg.sender] = balances[msg.sender].sub(amount);
        totalSupply_ = totalSupply_.sub(amount);

        (bool sent,) = msg.sender.call{value: weiToSend}("");
        require(sent, "Failed to send Ether");
    }

    function totalSupply() external view override returns (uint256) {
        return totalSupply_;
    }

    function balanceOf(address account) external view override returns (uint256) {
        return balances[account];
    }

    function allowance(address owner, address spender) external view override returns (uint256) {
        return allowances[owner][spender];
    }

    function transfer(address recipient, uint256 amount) external isUnlocked(msg.sender) override returns (bool) {
        require(balances[msg.sender] >= amount);

        balances[msg.sender] = balances[msg.sender].sub(amount);
        balances[recipient] = balances[recipient].add(amount);

        emit Transfer(msg.sender, recipient, amount);

        return true;
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        allowances[msg.sender][spender] = amount;

        emit Approval(msg.sender, spender, amount);

        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) override isUnlocked(sender) external returns (bool) {
        require(allowances[sender][msg.sender] >= amount);

        transferFromNoAllowanceCheck(sender, recipient, amount);
        allowances[sender][msg.sender] = allowances[sender][msg.sender].sub(amount);

        return true;
    }

    function transferFromNoAllowanceCheck(address sender, address recipient, uint256 amount) internal {
        require(balances[sender] >= amount, "not enough funds");

        balances[sender] = balances[sender].sub(amount);
        balances[recipient] = balances[recipient].add(amount);

        emit Transfer(sender, recipient, amount);
    }

    function setLock(uint256 amount, uint256 nonce, bytes memory signature) external {
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            keccak256("ClientLockAuthorization(uint256 amount,uint256 nonce)"),
            amount,
            nonce
        )));

        address client = ECDSA.recover(digest, signature);

        require(isUnlocked_(client), "1");
        require(nonces[nonce] == false, "2");

        nonces[nonce] = true;
        
        transferFromNoAllowanceCheck(client, msg.sender, amount);

        locked[client] = Lock({
            timestamp: block.timestamp,
            router: msg.sender,
            nonce: nonce
        });
    }

    function releaseLock(uint256 amount, uint256 nonce, bytes memory signature) external {        
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            keccak256("ClientTransferAuthorization(uint256 amount,uint256 nonce)"),
            amount,
            nonce
        )));

        address client = ECDSA.recover(digest, signature);

        require(!isUnlocked_(client));
        require(locked[client].router == msg.sender);
        require(locked[client].nonce == nonce);

        delete locked[client];

        transferFromNoAllowanceCheck(client, msg.sender, amount);
    }    
}