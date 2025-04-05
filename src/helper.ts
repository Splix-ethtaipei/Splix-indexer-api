import dotenv from "dotenv";
import { ethers } from "ethers";
dotenv.config();

export const zircuitTestnetRpcUrl = process.env.ZIRCUIT_TESTNET_RPC_URL;
export const ethereumSepoliaRpcUrl = process.env.ETHEREUM_SEPOLIA_RPC_URL;
export const ethereumMainnetRpcUrl = process.env.ETHEREUM_MAINNET_RPC_URL;
export const indexLimit = process.env.BLOCK_INDEX_LIMIT as unknown as number
export const ethereumSepoliaReceiptStorageContractAddress = process.env.ETHEREUM_SEPOLIA_RECEIPT_STORAGE_CONTRACT_ADDRESS;
export const zircuitTestnetReceiptStorageContractAddress = process.env.ZIRCUIT_TESTNET_RECEIPT_STORAGE_CONTRACT_ADDRESS;
export const ethereumMainnetReceiptStorageContractAddress = process.env.ETHEREUM_MAINNET_RECEIPT_STORAGE_CONTRACT_ADDRESS;
export const zircuitTestnetStartBlock: number | null = process.env.ZIRCUIT_TESTNET_START_BLOCK ? parseInt(process.env.ZIRCUIT_TESTNET_START_BLOCK) : null;
export const ethereumSepoliaStartBlock: number | null = process.env.ETHEREUM_SEPOLIA_START_BLOCK ? parseInt(process.env.ETHEREUM_SEPOLIA_START_BLOCK) : null;
export const ethereumMainnetStartBlock: number | null = process.env.ETHEREUM_MAINNET_START_BLOCK ? parseInt(process.env.ETHEREUM_MAINNET_START_BLOCK) : null;

// event GroupCreated(uint256 indexed groupId, address indexed owner, string groupName, uint256 itemCount)
export const groupCreatedEventSignature = ethers.id("GroupCreated(uint256,address,string,uint256)");

// event GroupEdited(uint256 indexed groupId, address indexed owner, uint256 itemCount);
export const groupEditedEventSignature = ethers.id("GroupEdited(uint256,address,uint256)");

// event ItemCreated(uint256 indexed groupId, uint256 indexed itemId, string itemName, uint256 itemPrice);
export const itemCreatedEventSignature = ethers.id("ItemCreated(uint256,uint256,string,uint256)");

// event ItemEdited(uint256 indexed groupId, uint256 indexed itemId, string itemName, uint256 itemPrice);
export const itemEditedEventSignature = ethers.id("ItemEdited(uint256,uint256,string,uint256)");

// event ItemsPaid(uint256 indexed groupId, address indexed payer, uint256[] itemIds, uint256 totalAmount);
export const itemPaidEventSignature = ethers.id("ItemsPaid(uint256,address,uint256[],uint256)");

export const CHAIN_ID = process.env.CHAIN_ID;

export const getIndexingMethod = (): IndexingMethod => {
    if (CHAIN_ID === "1") {
        // ethereum mainnet
        return IndexingMethod.NODIT_EVENT;
    }
    else if (CHAIN_ID === "11155111") {
        // ethereum sepolia
        return IndexingMethod.NODIT_EVENT;
    }
    else if (CHAIN_ID === "48898") {
        // zircuit testnet
        return IndexingMethod.NODE_INDEXING;
    }
}

export enum IndexingMethod {
    NODIT_EVENT,
    NODE_INDEXING
}