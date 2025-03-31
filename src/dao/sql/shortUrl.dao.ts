import { In, Repository } from "typeorm";
import { ShortUrl } from "../../entities/sql/ShortUrl";
import { DatabaseProvider } from '../../boot/databaseProvider';

//create BaseDAO and move repeatable code there
export class ShortUrlDAO {
    private repo: Repository<ShortUrl>;

    constructor() {
        this.repo = DatabaseProvider.getDatabase().getDataSource().getRepository(ShortUrl);
    }

    public async create(data: ShortUrl) {
        return await this.repo.save(data);
    }

    public async getShortUrlById(data: {shortUrlId: string, userId: string}) {
        return await this.repo.findOneBy({id: data.shortUrlId, userId: data.userId, isActive: true});
    }

    public async getShortUrlByIdBulk(shortUrlId: string[]) {
        return await this.repo.find({
            where: {
                id: In(shortUrlId)
            }
        })
    }

    public async getShortUrl(shortUrl: string) {
        return await this.repo.findOneBy({shortUrl, isActive: true});
    }

    public async getUserShortUrlPaginated(data: {userId: string, itemsPerPage: number, skip: number}) {
        return await this.repo.find({
            where: {
                userId: data.userId,
                isActive: true
            },
            take: data.itemsPerPage,
            skip: data.skip
        })
    }
    //update and delete
    public async update(findObj: any, updateObj: any) {
        // return this.repo.update(findObj, updateObj);

        return await this.repo.createQueryBuilder()
            .update(ShortUrl)
            .set(updateObj)
            .where(findObj)
            .returning("*")
            .execute();
    }
}
