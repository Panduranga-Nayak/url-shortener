import { In, Repository } from "typeorm";
import { User } from "../../entities/sql/User";
import { DatabaseProvider } from '../../boot/databaseProvider'

//create BaseDAO and move repeatable code there
export class UserDAO {
    private repo: Repository<User>;

    constructor() {
        this.repo = DatabaseProvider.getDatabase().getDataSource().getRepository(User);
    }

    async findByIds(id: string[]): Promise<User[]> {
        return this.repo.find({
            where: {
                id: In(id),
                isActive: true
            }
        })
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.repo.findOneBy({ email });
    }

    async createUser(user: Partial<User>): Promise<User> {
        return this.repo.save(user);
    }

    async toggleUserStatus(id: string, isActive: boolean) {
        return this.repo.update({ id }, { isActive });
    }
}
