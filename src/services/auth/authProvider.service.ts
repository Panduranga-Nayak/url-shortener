import { AuthProviderDAO } from '../../dao/sql/authProvider.dao'

export class AuthProviderService {
    private static instance: AuthProviderService;
    private authProviderDAO: AuthProviderDAO;

    private constructor() {
        this.authProviderDAO = new AuthProviderDAO();
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new AuthProviderService();
        }
        return this.instance;
    }

    public async findByName(name: string) {
        return await this.authProviderDAO.findByName(name);
    }

}