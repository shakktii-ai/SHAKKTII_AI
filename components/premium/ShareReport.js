import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function ShareReportModal({
    open,
    onClose,
    skills = [],
    selectedPlatform,
    setSelectedPlatform,
    platforms
}) {
    const [activeSlide, setActiveSlide] = useState(0);

    useEffect(() => {
        if (!open || skills.length === 0) return;

        const timer = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % skills.length);
        }, 8000);

        return () => clearInterval(timer);
    }, [open, skills]);

    useEffect(() => {
        if (!open) setActiveSlide(0);
    }, [open]);

    if (!open) return null;

    const current = skills[activeSlide];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">

                {/* Header */}

                <div className="flex items-center justify-between border-b px-5 py-4">
                    <h3 className="font-semibold text-lg">
                        Share Your Report
                    </h3>
                    <div className="flex jusitfy-center items-center gap-2"><div className="flex items-center gap-1">
                        <img
                            src="/MM_LOGO.png"
                            alt="MockMingle"
                            className="h-6 w-6 object-contain"
                        />

                        <h2 className="text-[15px] font-bold bg-gradient-to-r from-[#215AB9] to-[#33B29C] bg-clip-text text-transparent">
                            MockMingle
                        </h2>
                    </div>

                        {/* Right */}
                        <button
                            onClick={onClose}
                            className="rounded-full p-1.5 transition hover:bg-gray-100"
                        >
                            <X size={18} className="text-gray-500" />
                        </button>

                    </div>
                </div>

                {/* Platforms */}

                <div className="flex justify-around border-b py-3">
                    {platforms.map((platform) => (
                        <button
                            key={platform.id}
                            onClick={() => setSelectedPlatform(platform)}
                            className={`flex flex-col items-center text-xs transition ${selectedPlatform.id === platform.id
                                ? `${platform.text} `
                                : "text-gray-900"
                                }`}
                        >
                            <img
                                src={platform.icon}
                                alt={platform.name}
                                className="h-5 w-5 mb-1"
                            />

                            {platform.name}
                        </button>
                    ))}
                </div>

                {/* Preview */}

                <div className="p-5">

                    <div className="rounded-xl border border-[#B794F6] p-4">

                        <h4 className="font-semibold text-black">
                            {current?.skill} - {current?.score}/10
                        </h4>

                        <p className="text-xs text-[#4A4A4A] mt-2 leading-relaxed line-clamp-4">
                            {current?.detailedFeedback}
                        </p>

                        {!!current?.opportunities?.length && (
                            <>
                                <h5 className="font-semibold text-sm mt-4 mb-2">
                                    Key Opportunities
                                </h5>

                                <ul className="space-y-2">
                                    {current.opportunities.slice(0, 2).map((item, index) => (
                                        <li
                                            key={index}
                                            className="flex gap-2 text-xs text-gray-700 "
                                        >
                                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-black flex-shrink-0" />
                                            <span className="line-clamp-4">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                    </div>

                    {/* Slider Dots */}

                    <div className="my-5 flex justify-center gap-2">
                        {skills.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveSlide(index)}
                                className={`transition-all duration-300 rounded-full ${activeSlide === index
                                    ? "w-6 h-2 bg-[#6F24E8]"
                                    : "w-2 h-2 bg-gray-300"
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Buttons */}

                    <div className="flex gap-3">

                        <button
                            className={`flex-1 rounded-lg py-3 text-sm font-semibold text-white ${selectedPlatform.color}`}
                        >
                            Share on {selectedPlatform.name}
                        </button>

                        <button
                            className="rounded-lg border px-5 text-sm font-medium hover:bg-gray-50"
                        >
                            Save
                        </button>

                    </div>

                </div>

            </div>
        </div>
    );
}