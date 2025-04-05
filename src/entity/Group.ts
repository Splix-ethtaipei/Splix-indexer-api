import { Entity, Column, PrimaryColumn } from "typeorm"

@Entity()
export class Group {

    @PrimaryColumn()
    id: number

    @PrimaryColumn()
    chainId: number

    @Column()
    name: string

    @Column()
    owner: string

    @Column()
    itemCount: number

}