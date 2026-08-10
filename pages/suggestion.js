import { useEffect, useState } from "react";
import { FaYoutube, FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/router";
import YouTube from "react-youtube";
import Footer from "@/components/dashboard/Footer";

const Suggestion = () => {
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [videosByDate, setVideosByDate] = useState({});
  const [watchTimes, setWatchTimes] = useState({});
  const router = useRouter();

  useEffect(() => {
    const fetchRecommendations = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      const userEmail = user?.email;
      console.log(userEmail);

      try {
        const response = await fetch("/api/youtube", {
          method: "GET",
          headers: {
            "user-email": userEmail,
          },
        });

        const data = await response.json();
        if (data.success && data.data.length > 0) {
          // Group videos by date
          const groupedVideos = {};
          data.data.forEach((entry) => {
            if (entry.recommendations && Array.isArray(entry.recommendations)) {
              const date = new Date(entry.createdAt).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              );

              if (!groupedVideos[date]) {
                groupedVideos[date] = [];
              }

              entry.recommendations.forEach((recommendation) => {
                groupedVideos[date].push({
                  ...recommendation,
                  createdAt: entry.createdAt,
                });
              });
            }
          });

          // Sort dates in descending order
          const sortedGroups = {};
          Object.keys(groupedVideos)
            .sort((a, b) => new Date(b) - new Date(a))
            .forEach((key) => {
              sortedGroups[key] = groupedVideos[key];
            });

          setVideosByDate(sortedGroups);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchRecommendations();
  }, []);

  // Save watch time to API
  const saveWatchTime = async (videoId, seconds) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userEmail = user?.email;

    if (!userEmail) return;
    console.log(`Saving watch time for ${videoId}: ${seconds}s`); // 👈 Add this
    try {
      await fetch("/api/youtube", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          videoId,
          watchTime: seconds,
        }),
      });
    } catch (err) {
      console.error("Error saving watch time:", err);
    }
  };

  // Track play/pause/ended events
  const handleStateChange = (event, videoId) => {
    setWatchTimes((prev) => {
      const updated = { ...prev };

      if (event.data === 1) {
        // playing
        if (!updated[videoId]) {
          updated[videoId] = { start: Date.now(), total: 0 };
        } else {
          updated[videoId].start = Date.now();
        }
      } else if (event.data === 2 || event.data === 0) {
        // paused or ended
        if (updated[videoId]?.start) {
          const elapsed = Math.floor(
            (Date.now() - updated[videoId].start) / 1000
          );
          updated[videoId].total += elapsed;
          delete updated[videoId].start;
          saveWatchTime(videoId, updated[videoId].total); // save here
        }
      }

      return updated;
    });
  };

  const extractVideoId = (url) => {
    try {
      const parsedUrl = new URL(url);
      return (
        parsedUrl.searchParams.get("v") ||
        parsedUrl.pathname.split("/").pop()
      );
    } catch (err) {
      return null;
    }
  };

  const renderYoutubeRecommendations = () => {
    if (loadingVideos) {
      return (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">
            Finding helpful video recommendations...
          </p>
        </div>
      );
    }

    if (!videosByDate || Object.keys(videosByDate).length === 0) {
      return (
        // <div className="flex justify-center items-center h-40">
        //   <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        // </div>
          <div className="text-center py-8">
          <p className="text-gray-600">No video recommendations available at the moment.</p>
        </div>
      );
    }

    return (
      <div className="mt-8 p-6 bg-white rounded-lg">
        <h2 className="flex items-center text-2xl font-semibold mb-4 text-[#FF0000]">
          {/* <FaYoutube className="mr-2" />  */}
          Recommended Videos by Skill
        </h2>

        {Object.entries(videosByDate).map(([date, groups]) => (
          <div key={date} className="mb-10">
            <h2 className="text-2xl font-semibold text-[#1F4CBD] mb-6 border-b border-gray-700 pb-2">
              {date}
            </h2>
            {groups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-8">
                <h3 className="text-xl text-black font-semibold mb-4">
                  {group.skill}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.videos.map((video, videoIndex) => {
                    const videoId = extractVideoId(video.url);
                    return (
                      <div
                        key={videoIndex}
                        className="bg-[#EFEFFB] rounded-lg overflow-hidden shadow-lg transition-shadow duration-300 hover:shadow-xl"
                      >
                        <div className="aspect-w-16 aspect-h-9">
                          <YouTube
                            videoId={videoId}
                            opts={{
                              width: "100%",
                              height: "250",
                              playerVars: {
                                autoplay: 0, // don't autoplay
                                controls: 1,
                              },
                            }}
                            onReady={(e) => {
                              // Store the player reference if needed
                              console.log(`Player ready for ${videoId}`);
                            }}
                            onStateChange={(e) => {
                              if (e.data === 5) {
                                // Player cued, safe to seek before play
                                if (video.watchTime && video.watchTime > 0) {
                                  console.log(`Resuming ${videoId} at ${video.watchTime}s`);
                                  e.target.seekTo(video.watchTime, true);
                                }
                              }

                              // handle play/pause/save time
                              handleStateChange(e, videoId);
                            }}
                          />

                        </div>
                        <div className="p-4">
                          <h4 className="font-normal text-black line-clamp-2 mb-1">
                            {video.title}
                          </h4>
                          <p className="text-black text-sm">
                            {group.skill} Video
                          </p>
                          <p className="text-black text-xs mt-2">
                            Added:{" "}
                            {new Date(video.createdAt || Date.now()).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-radial from-[#B3B3EA] via-[#E8E8F8] to-white text-white px-4 py-6">
      <div className="container mx-auto max-w-7xl">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center text-black mb-2 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold mb-8 text-center text-[#1F4CBD]">
          Skill-Based Video Suggestions
        </h1>
        {renderYoutubeRecommendations()}
      </div>
      <Footer/>
    </div>
  );
};

export default Suggestion;
