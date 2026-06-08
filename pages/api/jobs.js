import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const query = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
  const all = req.query.all === "true";
  const userId = req.query.userId || null;

  if (!query && !all) {
    return res.status(400).json({ error: "Query or all parameter is required" });
  }

  let dbAvailable = false;
  let collection = null;

  try {
    const client = await clientPromise;
    const db = client.db("myFirstDatabase");
    collection = db.collection("jobs");
    try {
      await collection.dropIndex("job_id_1");
    } catch (e) {
      // ignore
    }
    await collection.createIndex({ job_id: 1, userId: 1 }, { unique: true });
    dbAvailable = true;
  } catch (err) {
    console.warn("MongoDB connection failed, running in serverless fallback mode:", err);
  }

  if (all) {
    if (dbAvailable && collection) {
      try {
        const queryParams = userId ? { userId } : {};
        const jobs = await collection.find(queryParams).sort({ created_at: -1 }).toArray();
        return res.status(200).json({ jobs, total: jobs.length, source: "database" });
      } catch (dbReadErr) {
        console.error("Failed to fetch all jobs from MongoDB:", dbReadErr);
        return res.status(500).json({ error: `Database read failed: ${dbReadErr.message || dbReadErr}` });
      }
    }

    return res.status(503).json({ error: "Database is offline / unavailable" });
  }

  const serpUrl = `https://serpapi.com/search.json?engine=google_jobs&q=${encodeURIComponent(query || "")}&api_key=${process.env.SERP_API_KEY}`;

  let rawJobs = [];
  let serpError = null;

  try {
    const serpRes = await fetch(serpUrl);
    if (!serpRes.ok) {
      throw new Error(`SerpAPI HTTP ${serpRes.status}: ${serpRes.statusText}`);
    }
    const serpData = await serpRes.json();
    if (serpData.error) {
      if (
        serpData.error.toLowerCase().includes("hasn't returned any results") ||
        serpData.error.toLowerCase().includes("no results")
      ) {
        rawJobs = [];
      } else {
        throw new Error(serpData.error);
      }
    } else {
      rawJobs = serpData.jobs_results || [];
    }
  } catch (err) {
    console.error("SerpAPI error:", err);
    serpError = err.message || "Failed to fetch from SerpAPI";
  }

  const normalizedJobs = rawJobs.map((job) => ({
    job_id: job.job_id || `${job.title}-${job.company_name}-${job.location}`.replace(/\s+/g, "-").toLowerCase(),
    title: job.title,
    company: job.company_name,
    location: job.location,
    via: job.via,
    description: job.description,
    thumbnail: job.thumbnail || null,
    extensions: job.extensions || [],
    detected_extensions: job.detected_extensions || {},
    link: job.apply_options?.[0]?.link || job.related_links?.[0]?.link || null,
    search_query: (query || "").toLowerCase(),
    created_at: new Date(),
    userId: userId,
  }));

  if (dbAvailable && collection) {
    try {
      for (const doc of normalizedJobs) {
        try {
          await collection.updateOne(
            { job_id: doc.job_id, userId: doc.userId },
            { $setOnInsert: doc },
            { upsert: true }
          );
        } catch (e) {
          // duplicate key — already exists, skip
        }
      }
    } catch (dbWriteErr) {
      console.error("Failed to write new jobs to MongoDB:", dbWriteErr);
    }

    try {
      const fetchParams = { search_query: (query || "").toLowerCase() };
      if (userId) fetchParams.userId = userId;

      const jobs = await collection
        .find(fetchParams)
        .sort({ created_at: -1 })
        .toArray();
      return res.status(200).json({ jobs, total: jobs.length, source: "database" });
    } catch (dbReadErr) {
      console.error("Failed to fetch from MongoDB, returning raw jobs:", dbReadErr);
    }
  }

  if (serpError && !dbAvailable) {
    return res.status(503).json({ error: `Service Unavailable: Both database and search API failed. (${serpError})` });
  }

  return res.status(200).json({ jobs: normalizedJobs, total: normalizedJobs.length, source: "serpapi" });
}
