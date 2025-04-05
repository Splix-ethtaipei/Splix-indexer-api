import { AppDataSource } from "./data-source"
import { User } from "./entity/User"


import dotenv from "dotenv";

dotenv.config();

AppDataSource.initialize().then(async () => {

    console.log("Inserting a new user into the database...")
    const user = new User()
    user.firstName = "Timber"
    user.lastName = "Saw"
    user.age = 25
    await AppDataSource.manager.save(user)
    console.log("Saved a new user with id: " + user.id)

    console.log("Loading users from the database...")
    const users = await AppDataSource.manager.find(User)
    console.log("Loaded users: ", users)

    console.log("Here you can setup and run express / fastify / any other framework.")

}).catch(error => console.log(error))

// import { ethers } from "ethers";

// export function main() {
//     console.log("Hello");

//     // read from env
//     // setup db

//     // read latest stored block number
//     // index n number of blocks

//     // save latest stored block number
// }


// const rpcUrl = process.env.RPC_URL;
// const provider = new ethers.JsonRpcProvider(rpcUrl);

// main();



// event GroupCreated(uint256 indexed groupId, address indexed owner, uint256 itemCount);
// event GroupEdited(uint256 indexed groupId, address indexed owner, uint256 itemCount);
// event ItemCreated(uint256 indexed groupId, uint256 indexed itemId, string itemName, uint256 itemPrice);
// event ItemEdited(uint256 indexed groupId, uint256 indexed itemId, string itemName, uint256 itemPrice);
// event ItemsPaid(uint256 indexed groupId, address indexed payer, uint256[] itemIds, uint256 totalAmount);