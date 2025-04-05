import { Entity, Column, PrimaryColumn } from "typeorm"

@Entity()
export class Group {

    @PrimaryColumn()
    id: number

    @Column()
    owner: string

    @Column()
    itemCount: number

}