import { Types } from "mongoose";
import { ClickEventDAO } from "../dao/mongo/clickEvent.dao";
import { ClickEventType } from "../entities/mongo/clickEvents";

export class ClickEventService {
    private static instance: ClickEventService;
    private clickEventDAO: ClickEventDAO;

    private constructor(){
        this.clickEventDAO = new ClickEventDAO();
    }

    public static getInstance() {
        if(!this.instance) {
            this.instance = new ClickEventService();
        }
        return this.instance;
    }

    public async create(data: Partial<ClickEventType>) {
        return await this.clickEventDAO.create(data);
    }
    
    public async getRecordsBetweenDates(fromDate: Date, toDate: Date) {
        return await this.clickEventDAO.getRecordsBetweenDates(fromDate, toDate);
    }
}