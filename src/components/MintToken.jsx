import React, { useState } from "react";
import { ethers } from "ethers";
import abi from "../contract_ABI.json";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//const bscTestnetChainId = "0x61"; // Chain ID của BSC Testnet

const MintToken = () => {
  const [mintAmount, setMintAmount] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [usdtBalance, setUsdtBalance] = useState("0");
  
  //const contractAddress = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"; // Địa chỉ hợp đồng
  const usdtContractAddress = "0x71e5C63727AB6067DFBfD5c90ec6E56CD53E3F43"; // Địa chỉ hợp đồng của USDT
  const usdtAbi = [
    "function balanceOf(address owner) view returns (uint256)", // ABI cần thiết để lấy số dư
  ];
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("Metamask is not installed!");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum); // ethers v6
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      setWalletConnected(true);
      toast.success(`Connected: ${accounts[0]}`);
    } catch (error) {
      toast.error("Failed to connect wallet.");
    }
  };

const fetchUsdtBalance = async (signer) => {
    if (!usdtContractAddress) {
      console.error("USDT contract address is missing.");
      return;
    }

    try {
      const usdtContract = new ethers.Contract(usdtContractAddress, usdtAbi, signer);
      const balance = await usdtContract.balanceOf(await signer.getAddress());
      setUsdtBalance(ethers.formatUnits(balance, 18));
    } catch (error) {
      console.error("Error fetching USDT balance:", error);
      toast.error("Failed to fetch USDT balance.");
    }
  };
  
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
      <h2>Contract: 0x71e5C63727AB6067DFBfD5c90ec6E56CD53E3F43</h2>
      <button onClick={connectWallet} disabled={walletConnected}>
        {walletConnected ? "Wallet Connected" : "Connect Wallet"}
      </button>
      {walletConnected && (
        <div style={{ marginTop: "10px" }}>
          <p>Your USDT Balance: {usdtBalance} USDT</p>
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
