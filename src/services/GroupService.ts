import { EntityManager } from "typeorm";
import { Group } from "../entity/Group";

export class GroupService {
    constructor() { }

    async insertGroup(manager: EntityManager, group: Group) {
        // await manager.save(group)

        const repo = manager.getRepository(Group);
        const queryBuilder = repo.createQueryBuilder();
        const insertQuery = queryBuilder.insert();
        const insertSet = insertQuery.values(group);
        await insertSet.execute();
    }

    async updateGroup(manager: EntityManager, group: Group) {
        // await manager.createQueryBuilder().update(Group).set({
        //     owner: group.owner,
        //     itemCount: group.itemCount
        // }).where({ id: group.id }).execute()

        const repo = manager.getRepository(Group);
        const queryBuilder = repo.createQueryBuilder();
        const updateQuery = queryBuilder.update(Group);
        const updateSet = updateQuery.set({
            owner: group.owner,
            itemCount: group.itemCount
        });
        const updateWhere = updateSet.where({
            id: group.id
        });
        await updateWhere.execute();
    }
}