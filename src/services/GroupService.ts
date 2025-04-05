import { DataSource, EntityManager, Repository } from "typeorm";
import { Group } from "../entity/Group";
import { UserGroup } from "../entity/UserGroup";
import { GroupByUserModel } from "../models/GroupByUserModel";
import { GroupByIdModel, ItemModel, MemberModel } from "../models/GroupByIdModel";
import { Item } from "../entity/Item";

export class GroupService {
    constructor(private readonly db: DataSource) {
    }

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

    async getGroupsJoinedByUser(user: string): Promise<GroupByUserModel[]> {
        const normalizedUser = user.toLowerCase();

        const groups: GroupByUserModel[] = await
            this.db.getRepository(UserGroup)
                .createQueryBuilder("userGroup")
                .innerJoin("group", "group", "group.id = userGroup.groupId AND group.chainId = userGroup.chainId")
                .select([
                    "group.id as groupId",
                    "group.chainId as chainId",
                    "group.name as name",
                    "group.itemCount as itemCount",
                    "group.owner as owner"
                ])
                .where("userGroup.normalizedUser = :normalizedUser AND userGroup.hasJoined = true", { normalizedUser })
                .getRawMany();

        return groups;
    }

    async getGroupsRequestToJoinByUser(user: string): Promise<GroupByUserModel[]> {
        const normalizedUser = user.toLowerCase();

        const groups: GroupByUserModel[] = await
            this.db.getRepository(UserGroup)
                .createQueryBuilder("userGroup")
                .innerJoin("group", "group", "group.id = userGroup.groupId AND group.chainId = userGroup.chainId")
                .select([
                    "group.id as groupId",
                    "group.chainId as chainId",
                    "group.name as name",
                    "group.itemCount as itemCount",
                    "group.owner as owner"
                ])
                .where("userGroup.normalizedUser = :normalizedUser AND userGroup.hasJoined = false", { normalizedUser })
                .getRawMany();

        return groups;
    }

    async joinGroup(user: string, groupId: number, chainId: number) {
        const existUserGroup = await this.db.getRepository(UserGroup)
            .findOne({
                where: {
                    normalizedUser: user.toLowerCase(),
                    groupId: groupId,
                    chainId: chainId
                }
            })

        if (existUserGroup) {
            existUserGroup.hasJoined = true;
            await this.db.getRepository(UserGroup).save(existUserGroup);
            return existUserGroup;
        }

        const newUserGroup = new UserGroup();
        newUserGroup.normalizedUser = user.toLowerCase();
        newUserGroup.user = user;
        newUserGroup.groupId = groupId;
        newUserGroup.chainId = chainId;
        newUserGroup.hasJoined = true;
        await this.db.getRepository(UserGroup).save(newUserGroup);
    }

    async rejectJoinGroup(user: string, groupId: number, chainId: number) {
        const existUserGroup = await this.db.getRepository(UserGroup)
            .findOne({
                where: {
                    normalizedUser: user.toLowerCase(),
                    groupId: groupId,
                    chainId: chainId
                }
            })
        if (!existUserGroup) {
            return null;
        }

        await this.db.getRepository(UserGroup).delete(existUserGroup);
        return null;
    }

    async getGroupById(groupId: number, chainId: number): Promise<GroupByIdModel> {
        const group = await this.db.getRepository(Group)
            .createQueryBuilder("group")
            .where("group.id = :groupId AND group.chainId = :chainId", { groupId, chainId })
            .getOne();

        const items: ItemModel[] = await this.db.getRepository(Item)
            .createQueryBuilder("item")
            .select([
                "item.id as id",
                "item.name as name",
                "item.price as price",
                "item.hasPaid as hasPaid",
                "item.payer as payer"
            ])
            .where("item.groupId = :groupId AND item.chainId = :chainId", { groupId, chainId })
            .getRawMany();

        const members: MemberModel[] = await this.db.getRepository(UserGroup)
            .createQueryBuilder("userGroup")
            .select([
                "userGroup.user as user"
            ])
            .where("userGroup.groupId = :groupId AND userGroup.hasJoined = true AND userGroup.chainId = :chainId", { groupId, chainId })
            .getRawMany();

        return {
            id: group.id,
            name: group.name,
            owner: group.owner,
            items: items,
            members: members.map(member => member.user)
        }

    }
}