import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from '../sql/BaseEntity';

@Entity('short_urls')
@Unique(['shortUrl', 'originalUrl']) 
export class ShortUrl extends BaseEntity {
    @Column({ type: 'uuid' })
    userId!: string;

    @Column({ type: 'varchar', length: 10, unique: true })
    shortUrl!: string;

    @Column({ type: 'text' })
    originalUrl!: string;

    @Column({ type: 'boolean', default: true })
    isActive?: boolean;

    constructor(params: ShortUrl) {
        super();
        Object.assign(this, params);
    }
}