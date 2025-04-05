import { DataSource, EntityManager, Repository } from "typeorm";
import { LatestBlock } from "../entity/LatestBlock";

export class LatestBlockService {

    private readonly lastestBlockRepository: Repository<LatestBlock>;
    constructor(db: DataSource) {
        this.lastestBlockRepository = db.getRepository(LatestBlock);
    }

    async getLatestBlockNumber(): Promise<LatestBlock | null> {
        const latestBlockNumber = await this.lastestBlockRepository.findOne({})
        return latestBlockNumber
    }

    async upsertLatestBlockNumber(latestBlock: LatestBlock) {
        await this.lastestBlockRepository.upsert(latestBlock, ["id"]);
    }

    async updateLatestBlockNumber(manager: EntityManager, latestBlock: LatestBlock) {
        await manager.createQueryBuilder().update(LatestBlock)
            .set({
                latestBlockNumber: latestBlock.latestBlockNumber
            }).where({
                id: latestBlock.id
            }).execute()
    }
}