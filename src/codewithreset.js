import React, { useState } from "react";
import { ethers } from "ethers";
import CouponRedemptionABI from "./CouponRedemptionABI.json"; // ABI of the smart contract
import './styles.css'; // Import the CSS file

const App = () => {
  const [couponCode, setCouponCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [cashback, setCashback] = useState(0);
  const [error, setError] = useState("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const transactionprice=100000000000000;
  const coupons = {
    SAVE20: 20,
    BUY10:  10,
  };

  const contractAddress = "0xA22a7A0b3ae401E20Fc2863C7b2D09ca039b0EcF"; // Update with your contract address

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }
      await window.ethereum.request({ method: "eth_requestAccounts" });
      setIsWalletConnected(true);
      alert("Wallet connected successfully!");
    } catch (err) {
      alert("Wallet connection failed: " + err.message);
    }
  };

  const redeemCoupon = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
  
    const cashbackRate = coupons[couponCode.toUpperCase()];
    if (!cashbackRate) {
      setError("Invalid coupon code!");
      return;
    }
  
    try {
      setIsRedeeming(true);
      setError(""); // Clear any previous error
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CouponRedemptionABI, signer);
  
      const userAddress = await signer.getAddress();
  
      // Get wallet balance before redemption
      const balanceBefore = await provider.getBalance(userAddress);
      console.log("Balance Before Redemption:", ethers.utils.formatEther(balanceBefore), "ETH");
  
      // Call redeemCoupon on the contract
      const tx = await contract.redeemCoupon(couponCode.toUpperCase(), transactionprice);
      console.log("Transaction Sent:", tx.hash);
  
      await tx.wait(); // Wait for the transaction to be mined
  
      // Get wallet balance after redemption
      const balanceAfter = await provider.getBalance(userAddress);
      console.log("Balance After Redemption:", ethers.utils.formatEther(balanceAfter), "ETH");
  
      // Calculate the cashback received
      const cashbackReceived = balanceAfter.sub(balanceBefore);
      console.log("Cashback Received:", ethers.utils.formatEther(cashbackReceived), "ETH");
  
      setCashback(ethers.utils.formatEther(cashbackReceived)); // Set cashback after redemption
      alert(`Coupon ${couponCode} redeemed successfully! Cashback: ${ethers.utils.formatEther(cashbackReceived)} ETH.`);
    } catch (err) {
      console.error("Error occurred in redeemCoupon:", {
        code: err.code,
        message: err.message,
        data: err.data,
        stack: err.stack,
      });
      
      // Handling specific error case for no available coupons
      if (err.code === -32603) {
        alert("Sorry, the coupons are over.");
      } else if (err.code === -32603 && err.message.includes("revert Coupon already redeemed")) {
        setError("This coupon has already been redeemed.");
      } else {
        setError(err.message || "An error occurred during redemption.");
      }
    } finally {
      setIsRedeeming(false); // Set redeeming state to false once done
    }
  };
  

  const resetCoupon = async (couponCode) => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CouponRedemptionABI, signer);

      const userAddress = await signer.getAddress();
      const tx = await contract.resetCouponRedemption(userAddress, couponCode.toUpperCase());
      console.log("Reset Transaction Sent:", tx.hash);

      await tx.wait();
      console.log("Reset Transaction Mined");
      alert(`Coupon ${couponCode} has been reset.`);
    } catch (err) {
      console.error("Error occurred in resetCoupon:", {
        code: err.code,
        message: err.message,
        data: err.data,
        stack: err.stack,
      });
      alert(err.message || "An error occurred while resetting the coupon.");
    }
  };

  return (
    <div className="container">
      <h1 className="title">Coupon Redemption Portal</h1>
      {!isWalletConnected ? (
        <button
          className="button"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      ) : (
        <>
          <div className="input-section">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              className="input"
            />
            <button
              onClick={redeemCoupon}
              disabled={isRedeeming}
              className={`button ${isRedeeming ? 'disabled' : ''}`}
            >
              {isRedeeming ? "Redeeming..." : "Redeem Coupon"}
            </button>
          </div>
          {cashback > 0 && (
            <div className="success-box">
              <p className="success-text">Cashback: {cashback} tokens</p>
            </div>
          )}
          {error && (
            <div className="error-box">
              <p className="error-text">{error}</p>
            </div>
          )}
          <div className="coupon-section">
            <h2 className="coupon-header">Available Coupons</h2>
            <ul>
              {Object.entries(coupons).map(([code, rate]) => (
                <li key={code} className="coupon-item">
                  <span className="coupon-code">{code}</span>
                  <span className="coupon-rate">{rate}% cashback</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => resetCoupon(couponCode)}
            className="button"
          >
            Reset Coupon
          </button>
        </>
      )}
    </div>
  );
};

export default App;
