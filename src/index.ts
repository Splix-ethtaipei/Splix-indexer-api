import { AppDataSource } from "./data-source"
import { ethers } from "ethers";
import { LatestBlockService } from "./services/LatestBlockService";
import { GroupService } from "./services/GroupService";
import { ItemService } from "./services/ItemService";
import { normalIndexing } from "./normalIndexing";
import { indexLimit, getIndexingMethod, IndexingMethod, CHAIN_ID, ethereumMainnetRpcUrl, ethereumSepoliaRpcUrl, ethereumMainnetStartBlock, ethereumSepoliaStartBlock, zircuitTestnetStartBlock, zircuitTestnetRpcUrl, ethereumSepoliaReceiptStorageContractAddress, ethereumMainnetReceiptStorageContractAddress, zircuitTestnetReceiptStorageContractAddress } from "./helper";


(async () => {
    try {
        const db = await AppDataSource.initialize();
        const latestBlockService = new LatestBlockService(db)
        const groupService = new GroupService(db);
        const itemService = new ItemService();

        const indexingMethod = getIndexingMethod();

        if (CHAIN_ID === "1") {
            const provider = new ethers.JsonRpcProvider(ethereumMainnetRpcUrl);
            // await normalIndexing(provider,
            //     AppDataSource,
            //     latestBlockService,
            //     groupService,
            //     itemService,
            //     indexLimit,
            //     ethereumMainnetReceiptStorageContractAddress,
            //     ethereumMainnetStartBlock);
        } else if (CHAIN_ID === "11155111") {
            const provider = new ethers.JsonRpcProvider(ethereumSepoliaRpcUrl);
            await normalIndexing(provider,
                AppDataSource,
                latestBlockService,
                groupService,
                itemService,
                indexLimit,
                ethereumSepoliaReceiptStorageContractAddress,
                ethereumSepoliaStartBlock);
        }
        else if (CHAIN_ID === "48898") {
            const provider = new ethers.JsonRpcProvider(zircuitTestnetRpcUrl);
            // await normalIndexing(provider,
            //     AppDataSource,
            //     latestBlockService,
            //     groupService,
            //     itemService,
            //     indexLimit,
            //     zircuitTestnetReceiptStorageContractAddress,
            //     zircuitTestnetStartBlock);
        }
    } catch (error) {
        console.error("Error:", error);
    }
})();