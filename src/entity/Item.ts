import { Entity, Column, PrimaryColumn } from "typeorm"

@Entity()
export class Group {

    @PrimaryColumn()
    id: number

    @Column()
    groupId: number

    @Column()
    name: string

    @Column()
    price: number

}