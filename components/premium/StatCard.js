import React from 'react';

export default function StatCard({ label, value, subValue, icon: Icon, iconColor, iconBg, valueClassName }) {
    return (
        <div className="flex flex-col rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl ${iconBg}`}>
                    <Icon size={20} className={iconColor} />
                </div>
                <span className="text-sm font-medium text-slate-500">{label}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className={`font-bold text-slate-900 ${valueClassName || 'text-3xl'}`}>{value}</span>
                {subValue && <span className="text-lg font-medium text-slate-400">{subValue}</span>}
            </div>
        </div>
    );
}
