import express, { Request, Response, Router } from 'express';
import axios from 'axios';
import { ethers } from 'ethers';
import 'dotenv/config';

// ============ Configuration Constants ============
// Authentication
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// hardcoded txHash
const TX_HASH = '0xd16e6999ba55945caedf0cb4b950ae135883c0c765aff6c666daed1278ab669a';

// Chain-specific Parameters
const ETHEREUM_SEPOLIA_DOMAIN = '1'; // Source domain ID for Ethereum Sepolia testnet
const AVALANCHE_FUJI_DOMAIN = '0'; // Destination domain ID for Avalanche Fuji testnet

// Contract address
const AVALANCHE_FUJI_MESSAGE_TRANSMITTER = '0xe737e5cebeeba77efe34d4aa090756590b1ce275';
const RECEIPT_STORAGE_CONTRACT = process.env.ETHEREUM_SEPOLIA_RECEIPT_STORAGE_CONTRACT_ADDRESS;
const SEPOLIA_RPC = process.env.SEPOLIA_RPC || 'https://eth-sepolia.g.alchemy.com/v2/demo';

// ============ Client Configuration ============

// Create provider
const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);

// Create wallet with private key
const wallet = new ethers.Wallet(PRIVATE_KEY as string, provider);

// Define ABI fragment for the relay function
const relayAbi = [
  {
    type: 'function',
    name: 'relay',
    inputs: [
      { name: 'message', type: 'bytes' },
      { name: 'attestation', type: 'bytes' },
      { name: '_groupId', type: 'uint256' },
      { name: 'itemIds', type: 'uint256[]' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: 'relaySuccess', type: 'bool' }],
    stateMutability: 'nonpayable'
  }
];

// ============ Functions ============

/**
 * Polls the Circle API for attestation for a transaction
 * @param txHash The transaction hash from the burn transaction
 * @returns The attestation data or null if failed
 */
async function pollForAttestation(txHash: string): Promise<any> {
    console.log(`Polling for attestation for tx: ${txHash}`);
    const maxRetries = 50; // Maximum number of retries
    const interval = 5000; // 5 seconds between each poll
    
    const url = `https://iris-api-sandbox.circle.com/v2/messages/${ETHEREUM_SEPOLIA_DOMAIN}?transactionHash=${txHash}`;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt + 1} of ${maxRetries}`);
            const response = await axios.get(url);
            
            if (response.status === 404) {
                console.log('Attestation not yet available, waiting...');
            } else if (response.data?.messages?.[0]?.status === 'complete') {
                console.log('Attestation retrieved successfully!');
                console.log('Attestation:', response.data.messages[0]);
                return response.data.messages[0];
            }
        } catch (error) {
            console.error(`Error fetching attestation: ${error.message}`);
        }
        
        // Wait before next attempt
        await new Promise((resolve) => setTimeout(resolve, interval));
    }
    
    console.error('Failed to get attestation after maximum retries');
    return null;
}

/**
 * Relays a message to the ReceiptStorage contract
 * @param message The attestation message
 * @param attestation The attestation data
 * @param groupId The group ID
 * @param itemIds Array of item IDs
 * @param amount Total amount
 * @returns Transaction hash or error
 */
async function relayToContract(message: string, attestation: string, groupId: number, itemIds: number[], amount: bigint): Promise<string> {
  console.log(`Relaying message to contract for group ${groupId}`);
  
  try {
    // Create contract interface
    const contractInterface = new ethers.Interface(relayAbi);
    
    // Encode function data
    const data = contractInterface.encodeFunctionData('relay', [
      message,
      attestation,
      groupId,
      itemIds,
      amount
    ]);
    
    // Create transaction
    const tx = await wallet.sendTransaction({
      to: RECEIPT_STORAGE_CONTRACT,
      data: data
    });
    
    console.log(`Relay transaction sent: ${tx.hash}`);
    return tx.hash;
  } catch (error) {
    console.error('Error relaying to contract:', error);
    throw error;
  }
}

// ============ API Routes ============
export const relayTxApi = (app: express.Application): void => {
    const router: Router = express.Router();
    
    /**
     * Endpoint to initiate polling for attestation and relay the transaction
     */
    router.post('/relay-tx', async (req: Request, res: Response) => {
        try {
            const { txHash, groupId, itemIds, amount } = req.body;
            console.log(`Received relay request for tx: ${txHash}`);
            // if (!txHash || !groupId || !itemIds || !amount) {
            //     res.status(400).json({ error: 'Missing required fields: txHash, groupId, itemIds, or amount' });
            // }
            
            // Start polling for attestation
            // const attestationData = await pollForAttestation(txHash);
            const attestationData = await pollForAttestation(TX_HASH);
            
            if (!attestationData) {
                res.status(404).json({ error: 'Failed to retrieve attestation after multiple attempts' });
            }
            
            // Convert amount to BigInt
            const amountBigInt = BigInt(amount);
            console.log(`Amount BigInt: ${amountBigInt}`);
            
            // Relay the attestation to the contract
            const relayTxHash = await relayToContract(
                attestationData.message,
                attestationData.attestation,
                Number(groupId),
                itemIds.map(id => Number(id)),
                amountBigInt
            );
            
            // Send success response
            res.status(200).json({
                success: true,
                relayTxHash,
                message: 'Transaction successfully relayed'
            });
            
        } catch (error) {
            console.error('Error processing relay request:', error);
            // Send error response
            res.status(500).json({
                success: false,
                error: error.message || 'Internal server error'
            });
        }
    });
    
    /**
     * Endpoint to check attestation status without relaying
     */
    router.get('/check-attestation/:txHash', async (req: Request, res: Response) => {
        try {
            const { txHash } = req.params;
            
            if (!txHash) {
                res.status(400).json({ error: 'Missing transaction hash' });
            }
            
            const attestationData = await pollForAttestation(txHash);
            
            if (!attestationData) {
                res.status(404).json({ error: 'Attestation not found or not ready' });
            }
            
            // Send success response
            res.status(200).json({
                success: true,
                attestation: attestationData
            });
            
        } catch (error) {
            console.error('Error checking attestation:', error);
            // Send error response
            res.status(500).json({
                success: false,
                error: error.message || 'Internal server error'
            });
        }
    });
    
    // Mount the router onto the /api path
    app.use('/api', router);
};
