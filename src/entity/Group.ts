import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Group {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    owner: string

    @Column()
    itemCount: number

}