import React, { useState } from "react";
import { ethers } from "ethers";
import abi from "../contract_ABI.json";
import erc20Abi from "../erc20_ABI.json"; // ABI tiêu chuẩn ERC-20
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MintToken = () => {
  const [mintAmount, setMintAmount] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [usdtBalance, setUsdtBalance] = useState("0");

  // Địa chỉ hợp đồng của USDT (hoặc token ERC-20 bạn muốn kiểm tra số dư)
  const usdtContractAddress = "0x71e5C63727AB6067DFBfD5c90ec6E56CD53E3F43";

  // Kết nối ví
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("Metamask is not installed!");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum); // ethers v6
      const accounts = await provider.send("eth_requestAccounts", []);
      const account = accounts[0];
      setAccount(account);

      // Lấy số dư ETH
      const balanceWei = await provider.getBalance(account);
      const balanceEth = ethers.formatEther(balanceWei); // Chuyển đổi từ wei sang ETH
      setBalance(balanceEth);

      // Lấy số dư token USDT
      const usdtContract = new ethers.Contract(usdtContractAddress, erc20Abi, provider);
      const usdtBalanceWei = await usdtContract.balanceOf(account);
      const usdtBalanceFormatted = ethers.formatUnits(usdtBalanceWei, 6); // USDT thường có 6 chữ số thập phân
      setUsdtBalance(usdtBalanceFormatted);

      setWalletConnected(true);
      toast.success(`Connected: ${account}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to connect wallet.");
    }
  };

  // Hàm mint token
  const mintToken = async () => {
    if (!walletConnected) {
      toast.error("Please connect your wallet first.");
      return;
    }

    if (!mintAmount || !contractAddress) {
      toast.error("Please provide the contract address and mint amount.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum); // ethers v6
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const tx = await contract.mint(account, ethers.parseUnits(mintAmount, 18)); // parseUnits in v6
      toast.info("Minting in progress...");
      await tx.wait();
      toast.success("Token minted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to mint tokens.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <ToastContainer />
      <h1>Mint Token</h1>
      <button onClick={connectWallet} disabled={walletConnected}>
        {walletConnected ? "Wallet Connected" : "Connect Wallet"}
      </button>
      {walletConnected && (
        <div style={{ marginTop: "20px" }}>
          <p>
            <strong>Wallet Address:</strong> {account}
          </p>
          <p>
            <strong>Balance:</strong> {balance} ETH
          </p>

          <p>
            <strong>USDT Address:</strong> {usdtContractAddress}
          </p>
          <p>
            <strong>USDT Balance:</strong> {usdtBalance} USDT
          </p>
        </div>
      )}
      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Contract Address"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          style={{ padding: "10px", margin: "10px 0", width: "300px" }}
        />
        <br />
        <input
          type="number"
          placeholder="Mint Amount"
          value={mintAmount}
          onChange={(e) => setMintAmount(e.target.value)}
          style={{ padding: "10px", margin: "10px 0", width: "300px" }}
        />
        <br />
        <button onClick={mintToken} style={{ padding: "10px 20px" }}>
          Mint Token
        </button>
      </div>
    </div>
  );
};

export default MintToken;
