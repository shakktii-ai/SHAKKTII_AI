import connectDB from "../../../middleware/dbConnect";
import Youtube from "../../../models/Youtube";

export default async function handler(req, res) {
  await connectDB();

  // Handle GET request
  // if (req.method === 'GET') {
  //   try {
  //     const { userId } = req.query;
  //     const query = userId ? { userId } : {};
  //     const recommendations = await Youtube.find(query);
  //     console.log("Recommendations:", recommendations);
  //     return res.status(200).json({ success: true, data: recommendations });
  //   } catch (error) {
  //     return res.status(500).json({ success: false, error: error.message });
  //   }
  // }

  if (req.method === 'GET') {
    try {
      const userEmail = req.headers['user-email'];
      console.log(userEmail);// read from custom header
      const query = userEmail ? { userEmail } : {};

      const recommendations = await Youtube.find(query);
      console.log("Recommendations:", recommendations);

      return res.status(200).json({ success: true, data: recommendations });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // Handle POST request
  if (req.method === 'POST') {
    try {
      const { userId, userEmail, recommendations } = req.body;

      if (!recommendations || !Array.isArray(recommendations)) {
        return res.status(400).json({
          success: false,
          error: 'Recommendations array is required'
        });
      }

      const newEntry = await Youtube.create({
        userId,
        userEmail,
        recommendations
      });

      return res.status(201).json({ success: true, data: newEntry });
    } catch (error) {
      console.error('Error saving YouTube recommendations:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to save recommendations'
      });
    }
  }
if (req.method === "PATCH") {
  try {
    const { userEmail, videoId, watchTime } = req.body;

    if (!userEmail || !videoId) {
      return res.status(400).json({ success: false, error: "Missing data" });
    }

    // Find the document for this user
    const userDoc = await Youtube.findOne({ userEmail });
    if (!userDoc) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    let videoFound = false;

    // Map instead of forEach (ensures mongoose change detection)
    userDoc.recommendations = userDoc.recommendations.map((rec) => {
      rec.videos = rec.videos.map((video) => {
        const vId =
          new URL(video.url).searchParams.get("v") ||
          video.url.split("/").pop();

        if (vId === videoId) {
           console.log("Updating", videoId, "with watchTime:", watchTime); 
          video.watchTime = watchTime;
          videoFound = true;
        }
        return video;
      });
      return rec;
    });

    if (!videoFound) {
      return res.status(404).json({ success: false, error: "Video not found" });
    }

    userDoc.markModified("recommendations"); // tell mongoose nested array changed
    await userDoc.save();
 console.log("Updated doc:", JSON.stringify(userDoc.recommendations, null, 2)); // ✅ log after save
    return res.status(200).json({ success: true, message: "Watch time updated" });
  } catch (error) {
    console.error("PATCH error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}



  // Handle unsupported HTTP methods
  res.setHeader('Allow', ['GET', 'POST','PATCH']);
  return res.status(405).json({
    success: false,
    error: `Method ${req.method} not allowed`
  });
}
