import { EntityManager } from "typeorm";
import { Item } from "../entity/Item";

export class ItemService {
    constructor() { }

    async insertItem(manager: EntityManager, item: Item) {
        await manager.save(item);
    }

    async updateItem(manager: EntityManager, item: Item) {
        await manager.createQueryBuilder().update(Item).where({
            id: item.id,
            groupId: item.groupId
        }).set({
            name: item.name,
            price: item.price,
            hasPaid: item.hasPaid
        }).execute()
    }
}