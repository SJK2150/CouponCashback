// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CouponRedemption {
    address public owner;
    mapping(string => uint256) public coupons; // Mapping of coupon codes to cashback rates
    mapping(address => mapping(string => bool)) public redeemedCoupons; // Tracks if a wallet has used a coupon

    event CouponRedeemed(address indexed user, string couponCode, uint256 cashback);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
        
        // Example coupon codes and their cashback rates
        coupons["SAVE20"] = 20; // 20 units of cashback
        coupons["BUY10"] = 10;  // 10 units of cashback
    }

    // Function to add or update a coupon with a cashback rate
    function addOrUpdateCoupon(string memory _couponCode, uint256 _cashbackRate) public onlyOwner {
        coupons[_couponCode] = _cashbackRate;
    }

    // Function to redeem a coupon
    function redeemCoupon(string memory _couponCode, uint256 transactionAmount) public {
        require(coupons[_couponCode] > 0, "Invalid coupon code");
        require(!redeemedCoupons[msg.sender][_couponCode], "Coupon already redeemed");

        uint256 cashbackRate = coupons[_couponCode];
        uint256 cashback = (transactionAmount * cashbackRate) / 100;  // Calculate cashback based on transaction amount
        redeemedCoupons[msg.sender][_couponCode] = true;

        // Ensure contract has enough balance to send the cashback
        require(address(this).balance >= cashback, "Not enough contract balance to redeem cashback");

        // Send cashback to the user
        (bool success, ) = msg.sender.call{value: cashback}("");
        require(success, "Cashback transfer failed");

        emit CouponRedeemed(msg.sender, _couponCode, cashback);
    }

    // Function to check if a coupon is valid
    function isValidCoupon(string memory _couponCode) public view returns (bool) {
        return coupons[_couponCode] > 0;
    }

    // Function to check if a coupon has been redeemed by a user
    function isCouponRedeemed(address user, string memory _couponCode) public view returns (bool) {
        return redeemedCoupons[user][_couponCode];
    }

    // Function to withdraw contract balance
    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // Function to check the contract's balance
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Fallback function to accept ETH deposits
    receive() external payable {}

    // Function to fund the contract with Ether (can be called by anyone)
    function fundContract() public payable {}

    // Function to reset the redeemed status for a specific user and coupon
    function resetCouponRedemption(address user, string memory _couponCode) public onlyOwner {
        redeemedCoupons[user][_couponCode] = false;
    }

    // Function to reset the redeemed status for all users (for all coupons)
    function resetAllRedemptions() public onlyOwner {
        // Loop through all users and reset redemption for all coupons
        // This requires more logic to keep track of users and their redeemed coupons.
        // If your contract needs to support this functionality, you can implement
        // it by storing user information and keeping track of redeemed coupons for each user.
    }
}

