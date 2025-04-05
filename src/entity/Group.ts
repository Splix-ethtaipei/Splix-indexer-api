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
    normalizedOwner: string
    
    @Column()
    itemCount: number

}