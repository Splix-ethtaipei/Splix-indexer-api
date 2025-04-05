// event ItemsPaid(uint256 indexed groupId, address indexed payer, uint256[] itemIds, uint256 totalAmount);

import { ethers, Log } from "ethers";
import { Item } from "../entity/Item";
import { CHAIN_ID } from "../helper";

// const abi = [
//     "event ItemsPaid(uint256 indexed groupId, address indexed payer, uint256[] itemIds, uint256 totalAmount);"
// ];

const abi = [{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "groupId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "payer", "type": "address" }, { "indexed": false, "internalType": "uint256[]", "name": "itemIds", "type": "uint256[]" }, { "indexed": false, "internalType": "uint256", "name": "totalAmount", "type": "uint256" }], "name": "ItemsPaid", "type": "event" }]

const eventInterface = new ethers.Interface(abi);


export interface ItemPaid {
    id: number;
    groupId: number;
    chainId: number;
    hasPaid: boolean;
    payer: string;
}

export const handleItemPaidEvent = (log: Log): ItemPaid[] => {
    const decoded = eventInterface.parseLog(log);
    const groupId = decoded.args.groupId;
    const payer = decoded.args.payer;
    const itemIds = decoded.args.itemIds;
    const totalAmount = decoded.args.totalAmount;


    return itemIds.map((itemId: number) => ({
        id: itemId,
        groupId: groupId,
        chainId: parseInt(CHAIN_ID),
        hasPaid: true,
        payer: payer
    }));
}
