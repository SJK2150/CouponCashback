import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import CouponRedemptionABI from "./CouponRedemptionABI.json";
import background from "./background.png"

const CouponRedemptionPortal = () => {
  const [couponCode, setCouponCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [cashback, setCashback] = useState(0);
  const [error, setError] = useState("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [transactionCount, setTransactionCount] = useState(1);

  const transactionprice = 100000000000000;
  const coupons = {
    SAVE20: 20,
    BUY10: 10,
  };

  const contractAddress = "0x1CB8Da838175634976f5B66F627d50C1c759B6E8";

  const containerStyle = {
    minHeight: "100vh",
    padding: "2rem",
    backgroundImage: `url(${background})`,
    backgroundColor: "#0B062B",
    backgroundBlend: "overlay",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "white",
    fontFamily: "'Inter', sans-serif",
  };

  const cardStyle = {
    background: "rgba(11, 6, 43, 0.2)", // More transparent background
    backdropFilter: "blur(8px)",
    borderRadius: "1rem",
    padding: "2rem",
    width: "80%",
    maxWidth: "500px",
    boxShadow: "0 8px 32px 0 rgba(8, 212, 248, 0.2)", // Lighter shadow
    border: "1px solid rgba(10, 212, 231, 0.1)", // More subtle border
    marginTop: "2rem",
  };

  const titleStyle = {
    fontSize: "2rem",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "2rem",
    background: "linear-gradient(45deg, #00f2fe, #4facfe)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "0 0 20px rgba(0, 242, 254, 0.3)", // Added glow effect
  };

  const buttonStyle = {
    background: "linear-gradient(45deg, #00f2fe, #4facfe)",
    border: "none",
    padding: "0.8rem 1.5rem",
    borderRadius: "0.5rem",
    color: "white",
    fontSize: "1rem",
    cursor: "pointer",
    width: "100%",
    transition: "transform 0.2s, opacity 0.2s",
    marginTop: "1rem",
    boxShadow: "0 4px 15px rgba(0, 242, 254, 0.2)", // Added subtle glow
  };

  const inputStyle = {
    width: "100%",
    padding: "0.8rem",
    borderRadius: "0.5rem",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(255, 255, 255, 0.05)", // More transparent input
    color: "white",
    fontSize: "1rem",
    marginBottom: "1rem",
    transition: "border-color 0.2s",
    outline: "none",
  };

  const couponListStyle = {
    listStyle: "none",
    padding: 0,
    margin: "1rem 0",
  };

  const couponItemStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.8rem",
    margin: "0.5rem 0",
    background: "rgba(255, 255, 255, 0.03)", // More transparent items
    borderRadius: "0.5rem",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    transition: "transform 0.2s",
  };

  const errorStyle = {
    background: "rgba(255, 59, 48, 0.08)", // More transparent error
    color: "#ff3b30",
    padding: "1rem",
    borderRadius: "0.5rem",
    marginTop: "1rem",
    textAlign: "center",
  };

  const successStyle = {
    background: "rgba(52, 199, 89, 0.08)", // More transparent success
    color: "#34c759",
    padding: "1rem",
    borderRadius: "0.5rem",
    marginTop: "1rem",
    textAlign: "center",
  };

  // Original functionality remains the same
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setIsWalletConnected(true);
        alert("Wallet connected successfully!");
      }
    } catch (err) {
      alert("Wallet connection failed: " + err.message);
    }
  };

  const redeemCoupon = async () => {
    // ... (keeping the original redeemCoupon logic)
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    const cashbackRate = coupons[couponCode.toUpperCase()];
    if (!cashbackRate) {
      setError("Invalid coupon code!");
      return;
    }

    if (transactionCount === 0) {
      setError("You can redeem coupons only after at least one transaction.");
      return;
    }

    if (transactionCount >= 2) {
      if (transactionprice <= 100 * 10 ** 18) {
        setError("You cannot redeem any more coupons after two transactions.");
        return;
      }
    }

    try {
      setIsRedeeming(true);
      setError("");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CouponRedemptionABI, signer);

      const userAddress = await signer.getAddress();
      const balanceBefore = await provider.getBalance(userAddress);

      const tx = await contract.redeemCoupon(couponCode.toUpperCase(), transactionprice);
      await tx.wait();

      setTransactionCount((prevCount) => prevCount + 1);

      const balanceAfter = await provider.getBalance(userAddress);
      const cashbackReceived = balanceAfter.sub(balanceBefore);

      setCashback(ethers.utils.formatEther(cashbackReceived));
      alert(`Coupon ${couponCode} redeemed successfully! Cashback: ${ethers.utils.formatEther(cashbackReceived)} ETH.`);
    } catch (err) {
      if (err.code === -32603) {
        alert("Sorry, the coupons are over.");
      } else if (err.message.includes("revert Coupon already redeemed")) {
        setError("This coupon has already been redeemed.");
      } else {
        setError(err.message || "An error occurred during redemption.");
      }
    } finally {
      setIsRedeeming(false);
    }
  };

  useEffect(() => {
    const autoConnectWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setIsWalletConnected(true);
          }
        } catch (err) {
          console.error("Error during auto-connection:", err);
        }
      }
    };

    autoConnectWallet();
  }, []);

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Coupon Redemption Portal</h1>
        {!isWalletConnected ? (
          <button style={buttonStyle} onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : (
          <>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              style={inputStyle}
            />
            <button
              onClick={redeemCoupon}
              disabled={isRedeeming}
              style={{
                ...buttonStyle,
                opacity: isRedeeming ? 0.7 : 1,
                cursor: isRedeeming ? "not-allowed" : "pointer",
              }}
            >
              {isRedeeming ? "Redeeming..." : "Redeem Coupon"}
            </button>

            {cashback > 0 && (
              <div style={successStyle}>
                <p>Cashback: {cashback} ETH</p>
              </div>
            )}

            {error && (
              <div style={errorStyle}>
                <p>{error}</p>
              </div>
            )}

            <div style={{ marginTop: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Available Coupons</h2>
              <ul style={couponListStyle}>
                {Object.entries(coupons).map(([code, rate]) => (
                  <li key={code} style={couponItemStyle}>
                    <span style={{ fontWeight: "bold" }}>{code}</span>
                    <span>{rate}% cashback</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CouponRedemptionPortal;
