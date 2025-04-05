import { EntityManager } from "typeorm";
import { Group } from "../entity/Group";

export class GroupService {
    constructor() { }

    async insertGroup(manager: EntityManager, group: Group) {
        await manager.save(group)
    }

    async updateGroup(manager: EntityManager, group: Group) {
        await manager.createQueryBuilder().update(Group).set({
            owner: group.owner,
            itemCount: group.itemCount
        }).where({ id: group.id }).execute()
    }
}