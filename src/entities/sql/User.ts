import 'reflect-metadata';
import { Entity, Column, BeforeInsert } from 'typeorm';
import { BaseEntity } from '../sql/BaseEntity';

@Entity('users')
export class User extends BaseEntity {
    @Column({ unique: true, nullable: true })
    email?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    password?: string;

    @Column({ type: 'varchar', length: 255 })
    username!: string;

    @BeforeInsert()
    generateUsername() {
        if (!this.username) {
            this.username = `${this.email || 'user'}${Date.now()}`;
        }
    }

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    @Column({ type: 'text', nullable: true, name: 'avatar_url' })
    avatarUrl?: string;

    constructor(params: Partial<User>) {
        super();
        Object.assign(this, params);
    }
}
