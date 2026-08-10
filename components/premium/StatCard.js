import React from 'react';

export default function StatCard({ label, value, subValue, icon: Icon, iconColor, iconBg, valueClassName, color }) {
    return (
        <div className={`flex flex-col rounded-2xl bg-white p-6 shadow-md border border-slate-100 border-l-[2px] ${color}`}>
            <div className="flex items-center gap-3 ">
                <div className={`p-2 rounded-full ${iconBg}`}>
                    <Icon size={36} className={iconColor} />
                </div>
                <div>
                <span className="text-[18px] font-normal text-black">{label}</span>
                <div className="flex items-baseline gap-1">
                    <span className={`font-normal text-slate-900 ${valueClassName || 'text-[15px]'}`}>{value}</span>
                    {subValue && <span className="text-[14px] font-medium text-slate-400">{subValue}</span>}
                </div>
                </div>
            </div>

        </div>
    );
}
