import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const query = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
  const locationParam = req.query.location ? (Array.isArray(req.query.location) ? req.query.location[0] : req.query.location) : "";
  const experience = req.query.experience || "";
  const mode = req.query.mode || ""; 
  const packageParam = req.query.package || ""; 
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
    } catch (e) { /* ignore */ }
    await collection.createIndex({ job_id: 1, userId: 1 }, { unique: true });
    dbAvailable = true;
  } catch (err) {
    console.warn("MongoDB connection failed, running in serverless fallback mode:", err);
  }

  // Handle "View All" saved jobs
  if (all) {
    if (dbAvailable && collection) {
      try {
        const queryParams = userId ? { userId } : {};
        const jobs = await collection.find(queryParams).sort({ created_at: -1 }).toArray();
        return res.status(200).json({ jobs, total: jobs.length, source: "database" });
      } catch (dbReadErr) {
        return res.status(500).json({ error: `Database read failed: ${dbReadErr.message}` });
      }
    }
    return res.status(503).json({ error: "Database is offline" });
  }

  // Take only the first location if a comma-separated list is supplied (e.g. "pune, Mumbai" -> "pune")
  const primaryLocation = locationParam.split(",")[0].trim();
  
  let apiSearchQuery = query || "";
  if (primaryLocation) {
    apiSearchQuery += ` in ${primaryLocation}`;
  } else {
    apiSearchQuery += " India"; 
  }

  const serpUrl = `https://serpapi.com/search.json?engine=google_jobs&q=${encodeURIComponent(apiSearchQuery)}&api_key=${process.env.SERP_API_KEY}`;

  let rawJobs = [];
  let serpError = null;

  try {
    const serpRes = await fetch(serpUrl);
    if (!serpRes.ok) throw new Error(`SerpAPI HTTP ${serpRes.status}`);
    const serpData = await serpRes.json();
    rawJobs = serpData.jobs_results || [];
  } catch (err) {
    console.error("SerpAPI error:", err);
    serpError = err.message || "Failed to fetch from SerpAPI";
  }

  // Helper functions to scrape deeper metadata from SerpAPI arrays
  const extractWorkMode = (job) => {
    const extensions = (job.extensions || []).map(e => e.toLowerCase());
    if (extensions.some(e => e.includes("remote") || e.includes("work from home"))) return "Remote";
    if (extensions.some(e => e.includes("hybrid"))) return "Hybrid";
    return "Onsite";
  };

  const extractSalary = (job) => {
    if (job.detected_extensions?.salary) return job.detected_extensions.salary;
    const salaryExt = (job.extensions || []).find(e => e.toLowerCase().includes("lakh") || e.includes("₹") || e.includes("$"));
    return salaryExt || "Not disclosed";
  };

  const extractExperience = (job) => {
    const textToScan = `${job.title} ${job.description} ${(job.extensions || []).join(" ")}`.toLowerCase();
    const match = textToScan.match(/(\d+)\s*-\s*(\d+)\s*(?:yrs|years)/) || textToScan.match(/(\d+)\s*(?:text|\+)\s*(?:yrs|years)/);
    return match ? `${match[0]}` : "0 - 3 Yrs"; // Smart default rather than hardcoded string
  };

  // --- FIX 2: PARSE THE REAL RAW DATA METADATA ---
  let normalizedJobs = rawJobs.map((job) => {
    const parsedMode = extractWorkMode(job);
    const parsedSalary = extractSalary(job);
    const parsedExp = extractExperience(job);

    return {
      job_id: job.job_id || `${job.title}-${job.company_name}-${job.location}`.replace(/\s+/g, "-").toLowerCase(),
      title: job.title,
      company: job.company_name,
      location: job.location || "India",
      via: job.via,
      description: job.description,
      thumbnail: job.thumbnail || null,
      extensions: job.extensions || [],
      detected_extensions: job.detected_extensions || {},
      link: job.apply_options?.[0]?.link || job.related_links?.[0]?.link || null,
      search_query: (query || "").toLowerCase(),
      work_mode: parsedMode, 
      experience: parsedExp,
      package: parsedSalary, 
      created_at: new Date(),
      userId: userId,
    };
  });


  let finalFilteredJobs = normalizedJobs.filter((job) => {
    // Filter out if user wanted a specific mode (e.g. Onsite) and it doesn't match
    if (mode && job.work_mode.toLowerCase() !== mode.toLowerCase()) {
      return false;
    }
    // Expand filter matches here later for packageParam / experience constraints if needed
    return true;
  });

  // Location sorting setup fallback
  if (!locationParam) {
    finalFilteredJobs.sort((a, b) => {
      const locA = (a.location || "").toLowerCase();
      const locB = (b.location || "").toLowerCase();
      if (locA.includes("pune") && !locB.includes("pune")) return -1;
      if (!locA.includes("pune") && locB.includes("pune")) return 1;
      return 0;
    });
  }

  // --- FIX 4: CACHE FRESH DATA WITH $set INSTEAD OF $setOnInsert ---
  if (dbAvailable && collection && !serpError) {
    try {
      for (const doc of finalFilteredJobs) {
        await collection.updateOne(
          { job_id: doc.job_id, userId: doc.userId },
          { $set: doc }, // This dynamically rewrites the item updates every query
          { upsert: true }
        );
      }
    } catch (dbWriteErr) {
      console.error("Failed to write update cache records:", dbWriteErr);
    }
    
    // Return the items directly from memory right away! Avoid reading what you just saved.
    return res.status(200).json({ jobs: finalFilteredJobs, total: finalFilteredJobs.length, source: "serpapi" });
  }

  // --- FALLBACK LAYER: Execute database fallback scan if SerpAPI failed
  if (serpError && dbAvailable && collection) {
    try {
      const fetchParams = { search_query: (query || "").toLowerCase() };
      if (userId) fetchParams.userId = userId;
      if (mode) fetchParams.work_mode = mode;

      const cachedJobs = await collection.find(fetchParams).sort({ created_at: -1 }).toArray();
      return res.status(200).json({ jobs: cachedJobs, total: cachedJobs.length, source: "database_fallback" });
    } catch (dbReadErr) {
      console.error("Fallback reading process failed:", dbReadErr);
    }
  }

  return res.status(200).json({ jobs: finalFilteredJobs, total: finalFilteredJobs.length, source: "serpapi_direct" });
}