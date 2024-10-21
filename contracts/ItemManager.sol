// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./Ownable.sol";
import "./Item.sol";

contract ItemManager is Ownable {
    enum SupplyChainState {Created, Paid, Delivered}

    struct S_Item {
        Item _item;
        string _identifier;
        uint _itemPrice;
        SupplyChainState _state;
        uint _rating; // Thêm trường đánh giá
        address _reviewer; // Địa chỉ người đánh giá
    }

    mapping(uint => S_Item) public items;
    uint itemIndex;

    event SupplyChainStep(uint indexed _itemIndex, uint _step, address _itemAddress);

    function createItem(string memory _identifier, uint _itemPrice) public {
        Item item = new Item(this, _itemPrice, itemIndex);
        items[itemIndex]._item = item;
        items[itemIndex]._identifier = _identifier;
        items[itemIndex]._itemPrice = _itemPrice;
        items[itemIndex]._state = SupplyChainState.Created;
        emit SupplyChainStep(itemIndex, uint(items[itemIndex]._state), address(item));
        itemIndex++;
    }

    function triggerPayment(uint _itemIndex) public payable {
        require(items[_itemIndex]._itemPrice == msg.value, "Only full payments accepted!");
        require(items[_itemIndex]._state == SupplyChainState.Created, "Item is further in the chain!");
        items[_itemIndex]._state = SupplyChainState.Paid;
        emit SupplyChainStep(_itemIndex, uint(items[_itemIndex]._state), address(items[_itemIndex]._item));
    }

    function triggerDelivery(uint _itemIndex) public {
        require(items[_itemIndex]._state == SupplyChainState.Paid, "Item is further in the chain!");
        items[_itemIndex]._state = SupplyChainState.Delivered;
        emit SupplyChainStep(_itemIndex, uint(items[_itemIndex]._state), address(items[_itemIndex]._item));
    }

    // Hàm đánh giá sản phẩm
    function rateItem(uint _itemIndex, uint _rating) public {
        S_Item storage item = items[_itemIndex]; // Lấy item

        require(item._state == SupplyChainState.Delivered, "Item must be delivered to rate");
        require(msg.sender == item._reviewer, "Only the buyer can rate the item");
        require(item._rating == 0, "Item has already been rated"); // Đảm bảo chỉ được đánh giá một lần

        item._rating = _rating; // Cập nhật đánh giá
        item._reviewer = msg.sender; // Ghi lại địa chỉ người đánh giá
    }

    // Thêm hàm để lấy thông tin đánh giá
    function getRating(uint _itemIndex) public view returns (uint) {
        return items[_itemIndex]._rating; // Trả về đánh giá của sản phẩm
    }
}
