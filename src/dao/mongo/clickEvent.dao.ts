import {ClickEvent, ClickEventType} from "../../entities/mongo/clickEvents";

export class ClickEventDAO {
    public async create(data: Partial<ClickEventType>) {
        return await ClickEvent.insertOne({
            trackingUrlId: data.trackingUrlId,
            shortUrlId: data.shortUrlId,
            ipAddress: data.ipAddress, 
            userAgent: data.userAgent,
            clickedAt: data.clickedAt,
        });
    }

    public async getRecordsBetweenDates(fromDate: Date, toDate: Date) {
        return await ClickEvent.find({
            clickedAt: { $gte: fromDate, $lte: toDate }
        });
    }
}