import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class LatestBlock {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    chainId: number

    @Column({type: 'bigint'})
    latestBlockNumber: bigint

}