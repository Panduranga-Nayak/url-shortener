import { Entity, Column, Unique, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('auth_providers')
export class AuthProvider {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    constructor(params?: AuthProvider) {
        Object.assign(this, params);
    }
}
