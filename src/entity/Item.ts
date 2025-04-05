import { Entity, Column, PrimaryColumn } from "typeorm"

@Entity()
export class Item {
    // composite key (id, groupId)
    @PrimaryColumn()
    id: number

    @PrimaryColumn()
    groupId: number

    @Column()
    name: string

    @Column()
    price: number

    @Column()
    hasPaid: boolean

}