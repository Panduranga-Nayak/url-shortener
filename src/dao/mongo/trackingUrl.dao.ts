import { TrackingUrl, TrackingUrlType } from "../../entities/mongo/trackingUrls";

export class TrackingUrlDAO {

    constructor() { }

    public async insertOne(data: Partial<TrackingUrlType>) {
        return await TrackingUrl.insertOne(data);
    }

    public async findTrackingUrl(data: Partial<TrackingUrlType>) {
        const obj: any = {
            shortUrlId: data.shortUrlId,
            utmSource: data.utmSource,
            isActive: true,
        }
        if(data.utmCampaign) obj.utmCampaign = data.utmCampaign;
        if(data.userId) obj.userId = data.userId;

        return await TrackingUrl.findOne(obj);
    }

    public async findByTrackingUrlIds(trackingUrlIds: string[]) {
        return await TrackingUrl.find({ _id: { $in: trackingUrlIds } });
    }

    public async updateTrackingUrl(findObj: { userId: string, _id: string, isActive?: boolean }, updateObj: Partial<TrackingUrlType>) {
        return await TrackingUrl.findOneAndUpdate(findObj, updateObj, { returnDocument: "after", new: true });
    }

    //used to bulk update/delete
    public async deleteTrackingUrlBulk(data: {userId: string, shortUrlId?: string}) {
        return await TrackingUrl.updateMany(data, {$set: {isActive: false}});
    }

    public async findTrackingUrlsByShortUrlIds(data: { shortUrlIds: string[] }) {
        return TrackingUrl.find({
          shortUrlId: { $in: data.shortUrlIds }
        });
    }
}