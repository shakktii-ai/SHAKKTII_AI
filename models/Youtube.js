import mongoose from "mongoose";

const youtubeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed, // ObjectId or string
      ref: "User",
      required: false,
      index: true,
    },
    userEmail: {
      type: String,
      required: false,
    },
    recommendations: [
      {
        skill: { type: String },
        videos: [
          {
            title: { type: String },
            url: { type: String },
             watchTime: { type: Number, default: 0 }, // ⏱ seconds watched
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Youtube || mongoose.model("Youtube", youtubeSchema);
