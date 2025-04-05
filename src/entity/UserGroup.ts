import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class UserGroup {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    user: string

    @Column()
    normalizedUser: string

    @Column()
    groupId: number

    @Column()
    chainId: number
    
    @Column()
    hasJoined: boolean

}