"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, TrendingUp, Play, ExternalLink, Sparkles, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "../../lib/utils";

export default function SkillItem({
    skill,
    score,
    status,
    lastTested,
    progressColor,
    summary,
    detailedFeedback,
    opportunities,
    resource
}) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);

    const statusColors = {
        Strong: "bg-[#ECFDF5] text-[#10B981]",
        Good: "bg-[#F0F9FF] text-[#0EA5E9]",
        "Not Attempted": "bg-slate-100 text-slate-500",
    };
  
    return (
        <div className={cn(
            "overflow-hidden rounded-2xl bg-gradient-to-r from-[#D6C8F5] via-[#E2D6F8] to-[#E4DBF8] shadow-sm border border-slate-100 transition-all duration-300",
            isExpanded ? "border-indigo-200 shadow-md ring-1 ring-indigo-50" : "hover:border-indigo-200 hover:shadow-md"
        )}>
            {/* Header Row (Clickable) */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex w-full items-center justify-between p-5 outline-none  transition-colors duration-200 cursor-pointer"
            >
                <div className="flex items-center gap-6 text-left">
                    <div className="relative flex h-18 w-18 items-center justify-center rounded-full bg-white p-1 ">
                        <svg className="h-16 w-16 -rotate-90 ">
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="transparent"
                                stroke="#F1F5F9"
                                strokeWidth="4"
                            />

                            {score !== "-" && (
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    fill="#D6C8F5"
                                    stroke={progressColor}
                                    strokeWidth="4"
                                    strokeDasharray={175.9}
                                    strokeDashoffset={
                                        175.9 -
                                        (175.9 * (typeof score === "string" ? 0 : score)) / 10
                                    }
                                    strokeLinecap="round"
                                />
                            )}
                        </svg>

                        <span className="absolute text-sm font-bold text-[#6F24E8]">
                            {score}/10
                        </span>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold tracking-tight text-[#6F24E8]">{skill}</h3>
                        <div className="flex items-center gap-1 mt-1">
                            <span className={cn("inline-flex items-center rounded-md px-1 py-0.5 text-[15px] font-normal")}>
                                {status}.
                            </span>
                            <span className="text-[15px] text-slate-800">Last tested: {lastTested}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-slate-400">
                    {status !== "Not Attempted" && <TrendingUp size={20} className="text-green-500" />}
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </button>

            {/* Expanded Content */}
            <div className={cn(
                "grid transition-all duration-300 ease-in-out",
                isExpanded ? "grid-rows-[1fr] opacity-100 border-t border-slate-50 bg-white" : "grid-rows-[0fr] opacity-0"
            )}>
                <div className="overflow-hidden">
                    <div className="p-6 space-y-6">
                        {/* <p className="text-slate-600 leading-relaxed font-medium">
                            {summary}
                        </p> */}

                        <div className="rounded-xl bg-[#6F24E8]/15 p-5">
                            <h4 className="text-sm font-semibold text-[#000000] mb-2 uppercase tracking-tight">Detailed Feedback</h4>
                            <p className="text-[#4A4A4A] text-sm leading-relaxed">
                                {detailedFeedback}
                            </p>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-4">Key Opportunities</h4>
                            <ul className="space-y-3">
                                {opportunities.map((item, index) => (
                                    <li
                                        key={index}
                                        onClick={() =>
                                            router.push(`/suggestion?skill=${encodeURIComponent(skill)}`)
                                        }
                                        className="flex items-start gap-2.5 text-[14px] text-[#4A4A4A]   group/item transition-colors"
                                    >
                                        <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#000000]  transition-colors" />

                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {resource && (
                            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-[#F5F3FF]">
                                        <Play size={18} className="text-[#5B21B6] fill-[#5B21B6]" />
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-semibold text-slate-900">{resource.title}</h5>
                                        <p className="text-xs text-slate-400">{resource.duration}</p>
                                    </div>
                                </div>
                                <ExternalLink size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                            </div>
                        )}
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => router.push(`/suggestion?skill=${encodeURIComponent(skill)}`)}
                                className="px-3 py-2 rounded-md bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-[15px] transition-all transform active:scale-[0.98] shadow-sm shadow-emerald-100 cursor-pointer"
                            >
                                Learning this skills
                            </button>
                           
                        </div>
                    </div>
                </div>
            </div>
                    </div>
    );
}
