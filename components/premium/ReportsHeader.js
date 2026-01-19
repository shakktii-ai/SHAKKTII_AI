import React, { useState, useRef, useEffect } from 'react';
import { Filter, Eye, X, Check, Calendar, Briefcase, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReportsHeader({ onViewFullReport, uniqueRoles = [], onFilterChange, activeFilters = { date: null, role: null } }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const dateOptions = [
        { label: "All Time", value: null },
        { label: "Past 7 Days", value: 7 },
        { label: "Past 30 Days", value: 30 },
    ];

    const handleDateSelect = (val) => {
        onFilterChange({ ...activeFilters, date: val });
    };

    const handleRoleSelect = (val) => {
        onFilterChange({ ...activeFilters, role: val });
    };

    return (
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end relative">
            <div>
                <h1 className="text-3xl font-bold text-[#0F172A] md:text-4xl tracking-tight">Your Progress Report</h1>
                <p className="mt-2 text-slate-500 text-lg font-medium opacity-80">Track your growth across all skill areas</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={cn(
                            "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-95",
                            isOpen || activeFilters.date || activeFilters.role
                                ? "border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        <Filter size={18} />
                        Filter
                        <ChevronDown size={14} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 mt-3 w-72 origin-top-right rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-slate-200 z-[60] animate-in fade-in zoom-in duration-200">
                            {/* Date Filter Section */}
                            <div className="px-3 py-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <Calendar size={10} />
                                    Time Period
                                </p>
                                <div className="space-y-1">
                                    {dateOptions.map((opt) => (
                                        <button
                                            key={opt.label}
                                            onClick={() => handleDateSelect(opt.value)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                                                activeFilters.date === opt.value
                                                    ? "bg-indigo-50 text-indigo-700 font-bold"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                                            )}
                                        >
                                            {opt.label}
                                            {activeFilters.date === opt.value && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="my-2 border-t border-slate-100" />

                            {/* Job Role Sections */}
                            <div className="px-3 py-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <Briefcase size={10} />
                                    Job Role
                                </p>
                                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                    <button
                                        onClick={() => handleRoleSelect(null)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left",
                                            activeFilters.role === null
                                                ? "bg-indigo-50 text-indigo-700 font-bold"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                                        )}
                                    >
                                        <span className="flex-1 text-left">All Roles</span>
                                        {activeFilters.role === null && <Check size={14} className="ml-2 shrink-0" />}
                                    </button>
                                    {uniqueRoles.map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => handleRoleSelect(role)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors capitalize text-left",
                                                activeFilters.role?.toLowerCase() === role.toLowerCase()
                                                    ? "bg-indigo-50 text-indigo-700 font-bold"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                                            )}
                                        >
                                            <span className="flex-1 text-left">{role}</span>
                                            {activeFilters.role?.toLowerCase() === role.toLowerCase() && <Check size={14} className="ml-2 shrink-0" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {(activeFilters.date || activeFilters.role) && (
                                <div className="mt-2 pt-2 border-t border-slate-100">
                                    <button
                                        onClick={() => {
                                            onFilterChange({ date: null, role: null });
                                            setIsOpen(false);
                                        }}
                                        className="w-full py-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <button
                    onClick={onViewFullReport}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
                >
                    <Eye size={18} />
                    View Full Report
                </button>
            </div>
        </div>
    );
}
