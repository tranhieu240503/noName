// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./ItemManager.sol";

contract Item {
    uint public priceInWei;
    uint public pricePaid;
    uint public index;
    ItemManager public parentContract; // Đảm bảo rằng đây là kiểu hợp đồng hợp lệ

    constructor(ItemManager _parentContract, uint _priceInWei, uint _index) {
        priceInWei = _priceInWei;
        index = _index;
        parentContract = _parentContract; // Đảm bảo truyền vào hợp đồng đúng kiểu
    }

    receive() external payable {
        require(pricePaid == 0, "Item is paid already!");
        require(priceInWei == msg.value, "Only full payments allowed");
        pricePaid += msg.value;
        (bool success,) = address(parentContract).call{value: msg.value}(abi.encodeWithSignature("triggerPayment(uint256)", index));
        require(success, "The transaction wasn't successful, cancelling");
    }

    fallback() external {
    }
}
