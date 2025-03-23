import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from '../sql/BaseEntity';

@Entity('auth')
@Unique(['authProviderId', 'providerUserId'])
export class Auth extends BaseEntity {
    @Column({ type: 'uuid' })
    userId!: string;

    @Column({ type: 'int' })
    authProviderId!: number;

    @Column({ type: 'varchar', length: 255 })
    providerUserId!: string;

    constructor(params?: Auth) {
        super();
        Object.assign(this, params);
    }
}
