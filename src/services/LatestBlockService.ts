import { DataSource, EntityManager, Repository } from "typeorm";
import { LatestBlock } from "../entity/LatestBlock";

export class LatestBlockService {

    private readonly lastestBlockRepository: Repository<LatestBlock>;
    constructor(db: DataSource) {
        this.lastestBlockRepository = db.getRepository(LatestBlock);
    }

    async getLatestBlockNumber(): Promise<LatestBlock | null> {
        const latestBlockNumber = await this.lastestBlockRepository.findOne({
            where: {},
            order: { id: "DESC" }
        })
        return latestBlockNumber
    }

    async upsertLatestBlockNumber(latestBlock: LatestBlock) {
        await this.lastestBlockRepository.upsert(latestBlock, ["id"]);
    }

    async updateLatestBlockNumber(manager: EntityManager, latestBlock: LatestBlock) {
        const repo = manager.getRepository(LatestBlock);
        const queryBuilder = repo.createQueryBuilder();
        const updateQuery = queryBuilder.update(LatestBlock);
        const updateSet = updateQuery.set({
            latestBlockNumber: latestBlock.latestBlockNumber
        });
        const updateWhere = updateSet.where({
            id: latestBlock.id
        });
        await updateWhere.execute();
        // await manager.getRepository(LatestBlock).createQueryBuilder().update(LatestBlock)
        //     .set({
        //         latestBlockNumber: latestBlock.latestBlockNumber
        //     }).where({
        //         id: latestBlock.id
        //     }).execute()
    }
}