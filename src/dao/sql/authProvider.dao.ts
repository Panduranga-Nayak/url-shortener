import { Repository } from "typeorm";
import { AuthProvider } from "../../entities/sql/AuthProvider";
import { DatabaseProvider } from '../../boot/databaseProvider'

//create BaseDAO and move repeatable code there
export class AuthProviderDAO {
    private repo: Repository<AuthProvider>;

    constructor() {
        this.repo = DatabaseProvider.getDatabase().getDataSource().getRepository(AuthProvider);
    }

    async findByName(name: string) {
        return await this.repo.findOneBy({ name });
    }
}
