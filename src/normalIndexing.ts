import { JsonRpcProvider } from "ethers";
import { DataSource, EntityManager } from "typeorm";
import { LatestBlockService } from "./services/LatestBlockService";
import { GroupService } from "./services/GroupService";
import { ItemService } from "./services/ItemService";
import { LatestBlock } from "./entity/LatestBlock";
import { Group } from "./entity/Group";
import { Item } from "./entity/Item";
import { handleItemPaidEvent, ItemPaid } from "./eventHandlers/itemPaidEventHandler";
import { handleGroupCreatedEvent } from "./eventHandlers/groupCreatedEventHandler";
import { CHAIN_ID, groupCreatedEventSignature, groupEditedEventSignature, itemCreatedEventSignature, itemEditedEventSignature, itemPaidEventSignature } from "./helper";
import { handleGroupEditedEvent } from "./eventHandlers/groupEditedEventHandler";
import { handleItemCreatedEvent } from "./eventHandlers/itemCreatedEventHandler";
import { handleItemEditedEvent } from "./eventHandlers/itemEditedEventHandler";

export async function normalIndexing(
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
        let latestBlock = await latestBlockService.getLatestBlockNumber(parseInt(CHAIN_ID));
        if (!latestBlock) {
            latestBlock = new LatestBlock()
            latestBlock.latestBlockNumber = BigInt(startBlockSetted ?? latestOnchainBlockNumber)
            latestBlock.chainId = parseInt(CHAIN_ID)
            await latestBlockService.upsertLatestBlockNumber(latestBlock);
            continue;
        }

        const latestStoredBlockNunber = BigInt(latestBlock.latestBlockNumber);
        const blockDiff = BigInt(latestOnchainBlockNumber) - BigInt(latestStoredBlockNunber);
        if (blockDiff === BigInt(0)) {
            // caught up to latest
            continue;
        }
        if (blockDiff < BigInt(0)) {
            // there is a reorg, for hackathon we ignore this case
            // delete data and update
            continue;
        }

        const blockNumberToIndex = blockDiff > indexLimit ? indexLimit : blockDiff;
        const startBlock = latestStoredBlockNunber + BigInt(1)
        const endBlock = BigInt(startBlock) + BigInt(blockNumberToIndex) - BigInt(1);
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

export async function innerNormalIndexing(
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
    let latestBlock = await latestBlockService.getLatestBlockNumber(parseInt(CHAIN_ID));

    if (!latestBlock) {
        latestBlock = new LatestBlock()
        latestBlock.latestBlockNumber = BigInt(startBlockSetted ?? latestOnchainBlockNumber)
        await latestBlockService.upsertLatestBlockNumber(latestBlock);
        return;
    }

    const latestStoredBlockNunber = latestBlock.latestBlockNumber;

    const blockDiff = BigInt(latestOnchainBlockNumber) - latestStoredBlockNunber;
    if (blockDiff === BigInt(0)) {
        // caught up to latest
        return;
    }
    if (blockDiff < 0) {
        // there is a reorg, for hackathon we ignore this case
        // delete data and update
        return;
    }

    const blockNumberToIndex = blockDiff > indexLimit ? indexLimit : blockDiff;
    const startBlock = latestStoredBlockNunber + BigInt(1)
    const endBlock = startBlock + BigInt(blockNumberToIndex) - BigInt(1);
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