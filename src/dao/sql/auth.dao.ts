import { Repository } from "typeorm";
import { Auth } from "../../entities/sql/Auth";
import { DatabaseProvider } from '../../boot/databaseProvider'

export class AuthDAO {
    private repo: Repository<Auth>;

    constructor() {
        this.repo = DatabaseProvider.getDatabase().getDataSource().getRepository(Auth);
    }

    async findAuth(userId: string, authProviderId: number) {
        return this.repo.findOneBy({ userId, authProviderId });
    }

    async createAuth(data: any) {
        return await this.repo.save(data);
    }
}
