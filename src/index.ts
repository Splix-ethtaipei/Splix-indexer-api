import { DataSource } from "typeorm";
import { AppDataSource } from "./data-source"
import { User } from "./entity/User"


import dotenv from "dotenv";

dotenv.config();

// AppDataSource.initialize().then(async () => {

//     console.log("Inserting a new user into the database...")
//     const user = new User()
//     user.firstName = "Timber"
//     user.lastName = "Saw"
//     user.age = 25
//     await AppDataSource.manager.save(user)
//     console.log("Saved a new user with id: " + user.id)

//     console.log("Loading users from the database...")
//     const users = await AppDataSource.manager.find(User)
//     console.log("Loaded users: ", users)

//     console.log("Here you can setup and run express / fastify / any other framework.")

// }).catch(error => console.log(error))

import { ethers, JsonRpcProvider } from "ethers";
import { LatestBlockService } from "./services/LatestBlockService";
import { LatestBlock } from "./entity/LatestBlock";

export async function main(
    provider: JsonRpcProvider,
    dataSource: DataSource,
    latestBlockService: LatestBlockService,
    indexLimit: number,
    receiptStorageContractAddress: string
) {
    console.log("Hello");

    while (true) {

        // read latest onchain block
        const latestOnchainBlockNumber = await provider.getBlockNumber();
        // read latest stored block number
        let latestBlock = await latestBlockService.getLatestBlockNumber();
        if (!latestBlock) {
            latestBlock = new LatestBlock()
            latestBlock.latestBlockNumber = latestOnchainBlockNumber
            await latestBlockService.upsertLatestBlockNumber(latestBlock);
            continue;
        }

        const latestStoredBlockNunber = latestBlock.latestBlockNumber;

        const blockDiff = latestOnchainBlockNumber - latestOnchainBlockNumber;
        if (blockDiff === 0) {
            // caught up to latest
            continue;
        }
        if (blockDiff < 0) {
            // there is a reorg, for hackathon we ignore this case
            // delete data and update
            continue;
        }

        const blockNumberToIndex = blockDiff > indexLimit ? indexLimit : blockDiff;
        const startBlock = latestStoredBlockNunber + 1
        const endBlock = startBlock + blockNumberToIndex - 1;
        const logs = await provider.getLogs({
            fromBlock: startBlock,
            toBlock: endBlock,
            address: receiptStorageContractAddress,
            topics: [[
                groupCreatedEventSignature,
                groupEditedEventSignature,
                itemCreatedEventSignature,
                itemEditedEventSignature,
                itemPaidEventSignature
            ]]
        });

        for (const log of logs) {
            const eventTopic = log.topics[0]; // check if this response needs to be normalized
            if (eventTopic === groupCreatedEventSignature) {

            } else if (eventTopic === groupEditedEventSignature) {

            } else if (eventTopic === itemCreatedEventSignature) {

            } else if (eventTopic === itemEditedEventSignature) {

            } else if (eventTopic === itemPaidEventSignature) {

            }
            else {
                // this should not happen
                continue;
            }
        }

        // save latest stored block number
    }

}


const rpcUrl = process.env.RPC_URL;
const indexLimit = process.env.BLOCK_INDEX_LIMIT as unknown as number
const receiptStorageContractAddress = process.env.RECEIPT_STORAGE_CONTRACT_ADDRESS;

// event GroupCreated(uint256 indexed groupId, address indexed owner, uint256 itemCount);
const groupCreatedEventSignature = ethers.id("GroupCreated(uint256,address,uint256)");

// event GroupEdited(uint256 indexed groupId, address indexed owner, uint256 itemCount);
const groupEditedEventSignature = ethers.id("GroupEdited(uint256,address,uint256)");

// event ItemCreated(uint256 indexed groupId, uint256 indexed itemId, string itemName, uint256 itemPrice);
const itemCreatedEventSignature = ethers.id("ItemCreated(uint256,uint256,string,uint256)");

// event ItemEdited(uint256 indexed groupId, uint256 indexed itemId, string itemName, uint256 itemPrice);
const itemEditedEventSignature = ethers.id("ItemEdited(uint256,uint256,string,uint256)");

// event ItemsPaid(uint256 indexed groupId, address indexed payer, uint256[] itemIds, uint256 totalAmount);
const itemPaidEventSignature = ethers.id("ItemsPaid(uint256,address,uint256[],uint256)");


(async () => {
    try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const db = await AppDataSource.initialize();
        // const manager = await AppDataSource.transaction
        const latestBlockService = new LatestBlockService(db)
        await main(provider, AppDataSource, latestBlockService, indexLimit, receiptStorageContractAddress);
    } catch (error) {
        console.error("Error:", error);
    }
})();