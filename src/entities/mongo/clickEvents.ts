import mongoose, { InferSchemaType, model } from "mongoose";

const clickEventSchema = new mongoose.Schema({
  trackingUrlId: { type: mongoose.Schema.Types.ObjectId, default: null },
  shortUrlId: { type: String },
  ipAddress: { type: String, required: true },
  userAgent: { type: String },
  country: { type: String },
  clickedAt: { type: Date, default: Date.now }
});

type ClickEventType = InferSchemaType<typeof clickEventSchema>;

const ClickEvent = model("ClickEvent", clickEventSchema, "click_events");

export { ClickEvent, ClickEventType };