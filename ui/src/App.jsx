import { useState, useEffect } from "react";
import { ethers, BrowserProvider, Contract } from "ethers";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Chip,
  LinearProgress
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import {
  CertAddr,
  MyGovernorAddr,
} from "./contract-data/deployedAddresses.json";
import { abi as Govabi } from "./contract-data/MyGovernor.json";
import { abi as Certabi } from "./contract-data/Cert.json";

function App() {
  const [loginState, setLoginState] = useState("Connect Wallet");
  const [proposals, setProposals] = useState([
    { 
      id: 1, 
      title: "Sample Proposal 1", 
      description: "This is a sample proposal description", 
      status: "Active",
      votesFor: 100,
      votesAgainst: 50,
      deadline: "2024-02-01"
    },
    { 
      id: 2, 
      title: "Sample Proposal 2", 
      description: "Another sample proposal description", 
      status: "Pending",
      votesFor: 75,
      votesAgainst: 25,
      deadline: "2024-02-05"
    }
  ]);
  const [votingPower, setVotingPower] = useState(1000);
  const [balance, setBalance] = useState(2000);
  const [isAdmin, setIsAdmin] = useState(true);
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [contracts, setContracts] = useState({});
  const [account, setAccount] = useState("");

  // Enhanced theme configuration
  const theme = {
    background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
    neonYellow: '#FFFF00',
    neonYellowGlow: '0 0 10px #FFFF00, 0 0 20px #FFFF00, 0 0 30px #FFFF00',
    neonPurple: '#b026ff',
    neonPurpleGlow: '0 0 10px #b026ff, 0 0 20px #b026ff, 0 0 30px #b026ff',
    cardBackground: 'rgba(20, 20, 20, 0.95)',
    cardBackgroundHover: 'rgba(30, 30, 30, 0.95)',
    textColor: '#FFFFFF',
    gradientText: 'linear-gradient(45deg, #FFFF00, #b026ff)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '10px'
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setLoginState("Connected: " + account.slice(0, 6) + "...");

        // Create provider
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        // Create contract instances
        const governorContract = new Contract(MyGovernorAddr, Govabi, signer);
        const certContract = new Contract(CertAddr, Certabi, signer);

        // Store these in state for later use
        setContracts({ governor: governorContract, cert: certContract });
        setAccount(account);

        // Load initial data
        // await getEvents();
      } else {
        console.error("Please install MetaMask");
        // setError("Please install MetaMask");
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
      // setError("Failed to connect wallet: " + err.message);
    }
  };

  const handleCreateProposal = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const govContract = new Contract(MyGovernorAddr, Govabi, signer);
      
      // This is a simplified example - adjust according to your needs
      const tx = await govContract.propose(
        [CertAddr],
        [0],
        ["0x"],
        description
      );
      await tx.wait();
      setOpen(false);
      alert("Proposal created successfully!");
    } catch (error) {
      console.error("Error creating proposal:", error);
      alert("Failed to create proposal");
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      minWidth: '100vw',
      background: theme.background,
      color: theme.textColor,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <AppBar position="static" sx={{ 
        background: 'rgba(10, 10, 10, 0.9)',
        backdropFilter: 'blur(10px)',
        boxShadow: theme.boxShadow,
        width: '100%'
      }}>
        <Toolbar>
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 'bold',
              background: theme.gradientText,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 10px rgba(255, 255, 0, 0.5)'
            }}
          >
            DAO Governance
          </Typography>
          <Button 
            variant="contained"
            startIcon={<AccountBalanceWalletIcon />}
            onClick={connectWallet}
            sx={{ 
              background: 'rgba(255, 255, 0, 0.1)',
              backdropFilter: 'blur(5px)',
              border: '1px solid rgba(255, 255, 0, 0.2)',
              color: theme.neonYellow,
              '&:hover': {
                background: 'rgba(255, 255, 0, 0.2)',
                boxShadow: theme.neonYellowGlow
              },
              transition: 'all 0.3s ease'
            }}
          >
            {loginState}
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ 
        flex: 1,
        width: '100%',
        height: 'calc(100vh - 64px)', // Subtract AppBar height
        overflow: 'auto',
        py: 3,
        px: { xs: 2, md: 4 }
      }}>
        <Grid container spacing={3} sx={{ height: '100%' }}>
          {/* Stats Cards */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ 
              height: '100%',
              p: 3,
              background: theme.cardBackground,
              backdropFilter: 'blur(16px)',
              borderRadius: theme.borderRadius,
              border: theme.border,
              boxShadow: theme.boxShadow,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.neonYellowGlow
              }
            }}>
              <Typography variant="h5" sx={{ 
                color: theme.neonYellow,
                mb: 3,
                fontWeight: 'bold'
              }}>
                Your Stats
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ 
                    p: 2, 
                    background: 'rgba(255, 255, 0, 0.1)',
                    borderRadius: theme.borderRadius
                  }}>
                    <Typography variant="overline" display="block" sx={{ color: theme.neonYellow }}>
                      Token Balance
                    </Typography>
                    <Typography variant="h4" sx={{ color: theme.textColor }}>
                      {balance}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ 
                    p: 2, 
                    background: 'rgba(176, 38, 255, 0.1)',
                    borderRadius: theme.borderRadius
                  }}>
                    <Typography variant="overline" display="block" sx={{ color: theme.neonPurple }}>
                      Voting Power
                    </Typography>
                    <Typography variant="h4" sx={{ color: theme.textColor }}>
                      {votingPower}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Proposals Section */}
          <Grid item xs={12} md={9}>
            <Paper sx={{ 
              height: '100%',
              p: 3,
              background: theme.cardBackground,
              backdropFilter: 'blur(16px)',
              borderRadius: theme.borderRadius,
              border: theme.border,
              boxShadow: theme.boxShadow,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3 
              }}>
                <Typography variant="h5" sx={{ 
                  color: theme.neonYellow,
                  fontWeight: 'bold'
                }}>
                  Active Proposals
                </Typography>
                <Button 
                  variant="contained"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => setOpen(true)}
                  sx={{ 
                    background: 'rgba(255, 255, 0, 0.1)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255, 255, 0, 0.2)',
                    color: theme.neonYellow,
                    '&:hover': {
                      background: 'rgba(255, 255, 0, 0.2)',
                      boxShadow: theme.neonYellowGlow
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Create Proposal
                </Button>
              </Box>
              
              <Box sx={{ 
                flex: 1,
                overflow: 'auto',
                pr: 2,
                mr: -2, // Compensate for padding to align with header
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: theme.neonYellow,
                  borderRadius: '4px',
                  '&:hover': {
                    background: theme.neonPurple,
                  },
                },
              }}>
                <Grid container spacing={2}>
                  {proposals.map((proposal) => (
                    <Grid item xs={12} key={proposal.id}>
                      <Card sx={{ 
                        background: theme.cardBackground,
                        borderRadius: theme.borderRadius,
                        border: theme.border,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateX(10px)',
                          boxShadow: theme.neonPurpleGlow
                        }
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ color: theme.textColor }}>
                              {proposal.title}
                            </Typography>
                            <Chip 
                              label={proposal.status} 
                              sx={{ 
                                background: proposal.status === 'Active' ? 'rgba(255, 255, 0, 0.1)' : 'rgba(176, 38, 255, 0.1)',
                                color: proposal.status === 'Active' ? theme.neonYellow : theme.neonPurple,
                                border: `1px solid ${proposal.status === 'Active' ? theme.neonYellow : theme.neonPurple}`,
                              }}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                            {proposal.description}
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: theme.neonYellow }}>
                              Votes Progress
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}
                              sx={{
                                height: 8,
                                borderRadius: 5,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  background: `linear-gradient(45deg, ${theme.neonYellow}, ${theme.neonPurple})`
                                }
                              }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                              <Typography variant="caption" sx={{ color: theme.neonYellow }}>
                                For: {proposal.votesFor}
                              </Typography>
                              <Typography variant="caption" sx={{ color: theme.neonPurple }}>
                                Against: {proposal.votesAgainst}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            Deadline: {proposal.deadline}
                          </Typography>
                        </CardContent>
                        <CardActions sx={{ p: 2, pt: 0 }}>
                          <Button 
                            startIcon={<HowToVoteIcon />}
                            sx={{ 
                              color: theme.neonYellow,
                              '&:hover': { color: theme.neonPurple }
                            }}
                          >
                            Vote For
                          </Button>
                          <Button 
                            startIcon={<HowToVoteIcon />}
                            sx={{ 
                              color: theme.neonYellow,
                              '&:hover': { color: theme.neonPurple }
                            }}
                          >
                            Vote Against
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Create Proposal Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        PaperProps={{
          style: {
            background: theme.cardBackground,
            backdropFilter: 'blur(16px)',
            borderRadius: theme.borderRadius,
            border: theme.border,
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          color: theme.neonYellow,
          borderBottom: '1px solid rgba(255, 255, 0, 0.1)'
        }}>
          Create New Proposal
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Proposal Title"
            fullWidth
            variant="outlined"
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: theme.textColor,
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 0, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: theme.neonYellow,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.neonYellow,
                },
              },
              '& .MuiInputLabel-root': {
                color: theme.neonYellow,
              }
            }}
          />
          <TextField
            multiline
            rows={4}
            margin="dense"
            label="Proposal Description"
            fullWidth
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                color: theme.textColor,
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 0, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: theme.neonYellow,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.neonYellow,
                },
              },
              '& .MuiInputLabel-root': {
                color: theme.neonYellow,
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setOpen(false)}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.5)',
              '&:hover': { color: theme.textColor }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleCreateProposal}
            sx={{ 
              background: 'rgba(255, 255, 0, 0.1)',
              color: theme.neonYellow,
              border: '1px solid rgba(255, 255, 0, 0.3)',
              '&:hover': {
                background: 'rgba(255, 255, 0, 0.2)',
                boxShadow: theme.neonYellowGlow
              }
            }}
          >
            Create Proposal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;