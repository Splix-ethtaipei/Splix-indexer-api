import { ethers, Log } from "ethers";
import { Item } from "../entity/Item";
import { CHAIN_ID } from "../helper";

// const abi = [
//     "event ItemEdited(uint256 indexed groupId, uint256 indexed itemId, string itemName, uint256 itemPrice);"
// ];

const abi = [{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "groupId", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "itemId", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "itemName", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "itemPrice", "type": "uint256" }], "name": "ItemEdited", "type": "event" }]

const eventInterface = new ethers.Interface(abi);

export const handleItemEditedEvent = (log: Log): Item => {
    const decoded = eventInterface.parseLog(log);
    const groupId = decoded.args.groupId;
    const itemId = decoded.args.itemId;
    const itemName = decoded.args.itemName;
    const itemPrice = decoded.args.itemPrice;

    return {
        id: itemId,
        chainId: parseInt(CHAIN_ID),
        groupId: groupId,
        name: itemName,
        price: itemPrice,
        hasPaid: false,
        payer: null
    };
}

