import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import dotenv from "dotenv";
import { LatestBlock } from "./entity/LatestBlock";
import { Group } from "./entity/Group";
import { Item } from "./entity/Item";

dotenv.config();

const dbHost = process.env.DATABASE_HOST
const dbPort = process.env.DATABASE_PORT as unknown as number;
const dbUsername = process.env.DATABASE_USERNAME;
const dbPassword = process.env.DATABASE_PASSWORD;
const dbName = process.env.DATABASE_NAME;

console.log(`dbHost: ${dbHost}`);

export const AppDataSource = new DataSource({
    type: "postgres",
    host: dbHost,
    port: dbPort,
    username: dbUsername,
    password: dbPassword,
    database: dbName,
    synchronize: true,
    logging: false,
    entities: [User, LatestBlock, Group, Item],
    migrations: [],
    subscribers: [],
})