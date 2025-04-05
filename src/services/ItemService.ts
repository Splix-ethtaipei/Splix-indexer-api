import { EntityManager } from "typeorm";
import { Item } from "../entity/Item";
import { ItemPaid } from "../eventHandlers/itemPaidEventHandler";

export class ItemService {
    constructor() { }

    async insertItem(manager: EntityManager, item: Item) {
        const repo = manager.getRepository(Item);
        const queryBuilder = repo.createQueryBuilder();
        const insertQuery = queryBuilder.insert();
        const insertSet = insertQuery.values(item);
        await insertSet.execute();
    }

    async updateItem(manager: EntityManager, item: Item) {
        // await manager.createQueryBuilder().update(Item).where({
        //     id: item.id,
        //     groupId: item.groupId
        // }).set({
        // name: item.name,
        // price: item.price,
        //     hasPaid: item.hasPaid
        // }).execute()

        const repo = manager.getRepository(Item);
        const queryBuilder = repo.createQueryBuilder();
        const updateQuery = queryBuilder.update(Item);
        const updateSet = updateQuery.set({
            name: item.name,
            price: item.price,
            hasPaid: item.hasPaid
        });
        const updateWhere = updateSet.where({
            id: item.id,
            groupId: item.groupId
        });
        await updateWhere.execute();
    }

    async updateItemPaid(manager: EntityManager, itemPaid: ItemPaid) {
        // await manager.createQueryBuilder().update(Item).where({
        //     id: itemPaid.id,
        //     groupId: itemPaid.groupId
        // }).set({
        //     hasPaid: itemPaid.hasPaid,
        //     payer: itemPaid.payer
        // }).execute()

        const repo = manager.getRepository(Item);
        const queryBuilder = repo.createQueryBuilder();
        const updateQuery = queryBuilder.update(Item);
        const updateSet = updateQuery.set({
            hasPaid: itemPaid.hasPaid,
            payer: itemPaid.payer
        });
        const updateWhere = updateSet.where({
            id: itemPaid.id,
            groupId: itemPaid.groupId
        });
        await updateWhere.execute();
    }
}