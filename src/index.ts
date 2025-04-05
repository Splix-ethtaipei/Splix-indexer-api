import { DataSource, EntityManager } from "typeorm";
import { AppDataSource } from "./data-source"
import { User } from "./entity/User"


import dotenv from "dotenv";
dotenv.config();

import { ethers, JsonRpcProvider } from "ethers";
import { LatestBlockService } from "./services/LatestBlockService";
import { LatestBlock } from "./entity/LatestBlock";
import { Item } from "./entity/Item";
import { Group } from "./entity/Group";
import { handleItemPaidEvent, ItemPaid } from "./eventHandlers/itemPaidEventHandler";
import { handleGroupCreatedEvent } from "./eventHandlers/groupCreatedEventHandler";
import { handleGroupEditedEvent } from "./eventHandlers/groupEditedEventHandler";
import { handleItemCreatedEvent } from "./eventHandlers/itemCreatedEventHandler";
import { handleItemEditedEvent } from "./eventHandlers/itemEditedEventHandler";
import { GroupService } from "./services/GroupService";
import { ItemService } from "./services/ItemService";

export async function main(
    provider: JsonRpcProvider,
    dataSource: DataSource,
    latestBlockService: LatestBlockService,
    groupService: GroupService,
    itemService: ItemService,
    indexLimit: number,
    receiptStorageContractAddress: string,
    startBlockSetted: number | null
) {
    while (true) {
        // read latest onchain block
        const latestOnchainBlockNumber = await provider.getBlockNumber();
        // read latest stored block number
        let latestBlock = await latestBlockService.getLatestBlockNumber();
        if (!latestBlock) {
            latestBlock = new LatestBlock()
            latestBlock.latestBlockNumber = startBlockSetted ?? latestOnchainBlockNumber
            await latestBlockService.upsertLatestBlockNumber(latestBlock);
            continue;
        }

        const latestStoredBlockNunber = latestBlock.latestBlockNumber;
        const blockDiff = latestOnchainBlockNumber - latestStoredBlockNunber;
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

        let createdGroups: Group[] = [];
        let editedGroups: Group[] = [];
        let createdItems: Item[] = [];
        let editedItems: Item[] = [];
        let paidItems: ItemPaid[] = [];
        latestBlock.latestBlockNumber = endBlock;

        for (const log of logs) {
            const eventTopic = log.topics[0]; // check if this response needs to be normalized
            if (eventTopic === groupCreatedEventSignature) {
                createdGroups.push(handleGroupCreatedEvent(log));
            } else if (eventTopic === groupEditedEventSignature) {
                editedGroups.push(handleGroupEditedEvent(log));
            } else if (eventTopic === itemCreatedEventSignature) {
                createdItems.push(handleItemCreatedEvent(log));
            } else if (eventTopic === itemEditedEventSignature) {
                editedItems.push(handleItemEditedEvent(log));
            } else if (eventTopic === itemPaidEventSignature) {
                paidItems.push(...handleItemPaidEvent(log));
            }
            else {
                // this should not happen
                continue;
            }
        }

        // save latest stored block number
        dataSource.transaction(async (manager: EntityManager) => {
            await latestBlockService.updateLatestBlockNumber(manager, latestBlock);

            for (const group of createdGroups) {
                await groupService.insertGroup(manager, group);
            }

            for (const group of editedGroups) {
                await groupService.updateGroup(manager, group);
            }

            for (const item of createdItems) {
                await itemService.insertItem(manager, item);
            }

            for (const item of editedItems) {
                await itemService.updateItem(manager, item);
            }

            for (const item of paidItems) {
                await itemService.updateItemPaid(manager, item);
            }
        });
    }

}


const rpcUrl = process.env.RPC_URL;
const indexLimit = process.env.BLOCK_INDEX_LIMIT as unknown as number
const receiptStorageContractAddress = process.env.RECEIPT_STORAGE_CONTRACT_ADDRESS;
const startBlock: number | null = process.env.START_BLOCK ? parseInt(process.env.START_BLOCK) : null;

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
        const latestBlockService = new LatestBlockService(db)
        const groupService = new GroupService();
        const itemService = new ItemService();
        await main(provider,
            AppDataSource,
            latestBlockService,
            groupService,
            itemService,
            indexLimit,
            receiptStorageContractAddress,
            startBlock);
        // await main2(provider,
        //     AppDataSource,
        //     latestBlockService,
        //     groupService,
        //     itemService,
        //     indexLimit,
        //     receiptStorageContractAddress,
        //     startBlock);
    } catch (error) {
        console.error("Error:", error);
    }
})();

// for testing
async function main2(
    provider: JsonRpcProvider,
    dataSource: DataSource,
    latestBlockService: LatestBlockService,
    groupService: GroupService,
    itemService: ItemService,
    indexLimit: number,
    receiptStorageContractAddress: string,
    startBlockSetted: number | null) {

    // read latest onchain block
    const latestOnchainBlockNumber = await provider.getBlockNumber();
    let latestBlock = await latestBlockService.getLatestBlockNumber();

    if (!latestBlock) {
        latestBlock = new LatestBlock()
        latestBlock.latestBlockNumber = startBlockSetted ?? latestOnchainBlockNumber
        await latestBlockService.upsertLatestBlockNumber(latestBlock);
        return;
    }

    const latestStoredBlockNunber = latestBlock.latestBlockNumber;

    const blockDiff = latestOnchainBlockNumber - latestStoredBlockNunber;
    if (blockDiff === 0) {
        // caught up to latest
        return;
    }
    if (blockDiff < 0) {
        // there is a reorg, for hackathon we ignore this case
        // delete data and update
        return;
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

    let createdGroups: Group[] = [];
    let editedGroups: Group[] = [];
    let createdItems: Item[] = [];
    let editedItems: Item[] = [];
    let paidItems: ItemPaid[] = [];
    latestBlock.latestBlockNumber = endBlock;

    for (const log of logs) {
        const eventTopic = log.topics[0]; // check if this response needs to be normalized
        if (eventTopic === groupCreatedEventSignature) {
            createdGroups.push(handleGroupCreatedEvent(log));
        } else if (eventTopic === groupEditedEventSignature) {
            editedGroups.push(handleGroupEditedEvent(log));
        } else if (eventTopic === itemCreatedEventSignature) {
            createdItems.push(handleItemCreatedEvent(log));
        } else if (eventTopic === itemEditedEventSignature) {
            editedItems.push(handleItemEditedEvent(log));
        } else if (eventTopic === itemPaidEventSignature) {
            paidItems.push(...handleItemPaidEvent(log));
        }
        else {
            // this should not happen
            continue;
        }
    }

    console.log("test")
    // save latest stored block number
    await dataSource.transaction(async (manager: EntityManager) => {
        await latestBlockService.updateLatestBlockNumber(manager, latestBlock);

        for (const group of createdGroups) {
            await groupService.insertGroup(manager, group);
        }

        for (const group of editedGroups) {
            await groupService.updateGroup(manager, group);
        }

        for (const item of createdItems) {
            await itemService.insertItem(manager, item);
        }

        for (const item of editedItems) {
            await itemService.updateItem(manager, item);
        }

        for (const item of paidItems) {
            await itemService.updateItemPaid(manager, item);
        }
    });
    console.log("completed")
}