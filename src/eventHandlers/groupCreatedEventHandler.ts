import { ethers, Log } from "ethers";
import { Group } from "../entity/Group";
import { CHAIN_ID } from "../helper";

// const abi = [
// 
//  event GroupCreated(uint256 indexed groupId, address indexed owner, string groupName, uint256 itemCount)
// ];

const abi = [{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "groupId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": false, "internalType": "string", "name": "groupName", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "itemCount", "type": "uint256" }], "name": "GroupCreated", "type": "event" }]
const eventInterface = new ethers.Interface(abi);

export const handleGroupCreatedEvent = (log: Log): Group => {
    const decoded = eventInterface.parseLog(log);
    const name = decoded.args.groupName.replace(/\x00/g, '');
    console.log(`Group name: ${name}`)
    const groupId = decoded.args.groupId;
    const owner = decoded.args.owner;
    const normalizedOwner = owner.toLowerCase();
    const itemCount = decoded.args.itemCount;


    return {
        id: groupId,
        chainId: parseInt(CHAIN_ID),
        name,
        owner: owner,
        normalizedOwner,
        itemCount: itemCount
    };
}