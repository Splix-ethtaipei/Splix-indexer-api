import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Item {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    groupId: number

    @Column()
    name: string

    @Column()
    price: number

}