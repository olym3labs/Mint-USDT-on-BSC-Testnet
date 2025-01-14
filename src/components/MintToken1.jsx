import React, { useState } from "react";
import { ethers } from "ethers";
import abi from "../contractABI.json";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MintToken = () => {
  const [mintAmount, setMintAmount] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  
  const contractAddress = "0xa90FED1Ba828cE85cCAa45e84b5FCFa1b21fE5ac";
  //const contractAddress = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";
  const BSC_TESTNET_CHAIN_ID = "0x61"; // Chain ID for BSC Testnet

  // Connect wallet and ensure it's on BSC Testnet
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("Metamask is not installed!");
      return;
    }

    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const network = await web3Provider.getNetwork();
      const chainId = `0x${network.chainId.toString(16)}`;

      if (chainId !== BSC_TESTNET_CHAIN_ID) {
        // Prompt user to switch to BSC Testnet
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: BSC_TESTNET_CHAIN_ID }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            // If BSC Testnet is not added to MetaMask, add it
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: BSC_TESTNET_CHAIN_ID,
                  chainName: "Binance Smart Chain Testnet",
                  nativeCurrency: {
                    name: "Binance Coin",
                    symbol: "BNB",
                    decimals: 18,
                  },
                  rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
                  blockExplorerUrls: ["https://testnet.bscscan.com"],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }

      const signer = await web3Provider.getSigner();
      setProvider(web3Provider);
      setAccount(await signer.getAddress());
      setWalletConnected(true);

      const contractInstance = new ethers.Contract(contractAddress, abi, signer);
      setContract(contractInstance);

      toast.success("Wallet connected and ready!");
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet. Please try again.");
    }
  };

  const mintTokens = async () => {
    if (!walletConnected || !contract) {
      toast.error("Please connect your wallet first!");
      return;
    }

    if (!mintAmount || isNaN(mintAmount) || mintAmount <= 0) {
      toast.error("Please enter a valid mint amount!");
      return;
    }

    try {
      const tx = await contract.mint(ethers.parseUnits(mintAmount.toString(), 18));
      toast.info("Minting tokens, please wait...");
      await tx.wait();
      toast.success("Tokens minted successfully!");
    } catch (error) {
      console.error("Minting error:", error);
      toast.error("Minting failed. Please check your input and try again.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Mint Tokens</h1>
      <button onClick={connectWallet}>
        {walletConnected ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
      </button>
      <div style={{ marginTop: "20px" }}>
        <input
          type="number"
          placeholder="Enter amount to mint"
          value={mintAmount}
          onChange={(e) => setMintAmount(e.target.value)}
        />
        <button onClick={mintTokens}>Mint</button>
      </div>
      <ToastContainer position="top-right" />
    </div>
  );
};

export default MintToken;
