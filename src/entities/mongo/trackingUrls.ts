import {model,Schema, InferSchemaType} from "mongoose";

const trackingUrlSchema = new Schema({
    userId: { type: String },
    createdAt: { type: Date, default: Date.now },
    shortUrlId: { type: String },
    utmSource: { type: String },
    utmCampaign: { type: String },
    isActive: { type: Boolean, default: true },
});

trackingUrlSchema.index({ shortUrlId: 1 });

type TrackingUrlType= InferSchemaType<typeof trackingUrlSchema>;
const TrackingUrl = model("TrackingUrl", trackingUrlSchema, "tracking_urls");

export { TrackingUrl, TrackingUrlType };
