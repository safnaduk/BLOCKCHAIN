import { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";
import {
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Chip,
  LinearProgress
} from "@mui/material";
import './App.css';

import {
  CertAddr,
  MyGovernorAddr,
} from "./contract-data/deployedAddresses.json";
import { abi as Govabi } from "./contract-data/MyGovernor.json";
import { abi as Certabi } from "./contract-data/Cert.json";

function App() {
  const [account, setAccount] = useState(null);
  const [loginState, setLoginState] = useState("Connect Wallet");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if wallet is already connected
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Get connected accounts
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setLoginState("Connected: " + accounts[0].slice(0, 6) + "...");
        }
      } catch (err) {
        console.error("Error checking wallet connection:", err);
        setError("Failed to check wallet connection");
      }
    }
  };

  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);

    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        setLoginState("Connected: " + accounts[0].slice(0, 6) + "...");
        
        // Switch to the correct network (Hardhat network)
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x7A69' }], // 31337 in hex for Hardhat
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0x7A69',
                    chainName: 'Hardhat Network',
                    rpcUrls: ['http://127.0.0.1:8545'],
                    nativeCurrency: {
                      name: 'ETH',
                      symbol: 'ETH',
                      decimals: 18
                    }
                  }
                ]
              });
            } catch (addError) {
              console.error("Error adding network:", addError);
              setError("Failed to add network to MetaMask");
            }
          } else {
            console.error("Error switching network:", switchError);
            setError("Failed to switch network");
          }
        }
      } catch (err) {
        console.error("Error connecting wallet:", err);
        setError("Failed to connect wallet");
      }
    } else {
      setError("Please install MetaMask");
    }
    setIsLoading(false);
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setLoginState("Connected: " + accounts[0].slice(0, 6) + "...");
        } else {
          setAccount(null);
          setLoginState("Connect Wallet");
        }
      });

      window.ethereum.on('chainChanged', (_chainId) => {
        // Handle chain change - you might want to reload the page
        window.location.reload();
      });
    }
  }, []);

  return (
    <Container className="app-container">
      {isLoading && <LinearProgress />}
      
      {error && (
        <Card className="error-card">
          <CardContent>
            <Typography color="error">{error}</Typography>
            <Button onClick={() => setError(null)}>Dismiss</Button>
          </CardContent>
        </Card>
      )}

      <div className="header">
        <Typography variant="h4" component="h1">
          DAO Governance
        </Typography>
        <Button
          variant="contained"
          onClick={connectWallet}
          disabled={isLoading}
          className="connect-button"
        >
          {loginState}
        </Button>
      </div>

      {account ? (
        <div className="main-content">
          {/* Your existing UI components here */}
        </div>
      ) : (
        <Card className="welcome-card">
          <CardContent>
            <Typography variant="h5" component="h2">
              Welcome to DAO Governance
            </Typography>
            <Typography variant="body1">
              Please connect your wallet to participate in governance
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export default App;
