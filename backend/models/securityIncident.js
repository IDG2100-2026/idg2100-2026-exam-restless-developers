import mongoose from "mongoose";

const securityIncidentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["ip_change"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    tokenIp: {
      type: String,
      required: true,
    },
    requestIp: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("SecurityIncident", securityIncidentSchema);