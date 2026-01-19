import React, { useMemo } from 'react';
import { X, FileDown, FileText, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

export default function DetailedReportModal({ isOpen, onClose, reportData, jobRole, date }) {
    // Memoize the parse and render logic to prevent re-processing on every scroll/render
    const analysisContent = useMemo(() => {
        if (!isOpen || !reportData?.reportAnalysis) return null;

        const text = reportData.reportAnalysis;

        // Helper to extract score and max score
        const parseScore = (text) => {
            const match = text.match(/(\d+)\/(\d+)/);
            if (match) {
                return {
                    current: parseInt(match[1]),
                    max: parseInt(match[2]),
                    percentage: (parseInt(match[1]) / parseInt(match[2])) * 100
                };
            }
            return null;
        };

        const getScoreColor = (percentage) => {
            if (percentage >= 70) return 'bg-emerald-500';
            if (percentage >= 40) return 'bg-amber-500';
            return 'bg-rose-500';
        };

        const getScoreBackground = (percentage) => {
            if (percentage >= 70) return 'bg-emerald-50';
            if (percentage >= 40) return 'bg-amber-50';
            return 'bg-rose-50';
        };

        const lines = text.split('\n');
        const sections = [];
        let currentSection = { title: '', content: [] };

        lines.forEach((line) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return;

            if (trimmedLine.startsWith('Detailed Analysis') || trimmedLine.startsWith('Analysis:') || trimmedLine.startsWith('Scoring:')) {
                if (currentSection.content.length > 0) sections.push({ ...currentSection });
                currentSection = { title: trimmedLine.replace(':', ''), content: [], isScoring: trimmedLine.includes('Scoring') };
                return;
            }

            if (trimmedLine.startsWith('For Improvement:')) {
                currentSection.content.push({ type: 'sub-header', text: trimmedLine });
                return;
            }

            if (currentSection.isScoring && trimmedLine.includes(':')) {
                const [label, scoreText] = trimmedLine.split(':').map(s => s.trim());
                const scoreData = parseScore(scoreText);
                if (scoreData) {
                    currentSection.content.push({ type: 'score', label, ...scoreData, raw: scoreText });
                    return;
                }
            }

            if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
                currentSection.content.push({ type: 'list-item', text: trimmedLine.substring(1).trim() });
                return;
            }

            currentSection.content.push({ type: 'paragraph', text: trimmedLine });
        });

        if (currentSection.content.length > 0) sections.push(currentSection);

        return sections.map((section, idx) => (
            <div key={idx} className="mb-10 last:mb-0">
                <h3 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
                    {section.isScoring ? <TrendingUp className="text-indigo-600" size={24} /> : <FileText className="text-indigo-600" size={24} />}
                    {section.title}
                </h3>

                <div className={`${section.isScoring ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}`}>
                    {section.content.map((item, i) => {
                        if (item.type === 'score') {
                            return (
                                <div key={i} className={`p-4 rounded-xl border border-slate-100 ${getScoreBackground(item.percentage)} transition-colors`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold text-slate-700">{item.label}</span>
                                        <span className="text-sm font-bold text-slate-900">{item.raw}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getScoreColor(item.percentage)}`}
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        }
                        if (item.type === 'sub-header') {
                            return <h4 key={i} className="text-lg font-bold text-indigo-700 mt-6 mb-2 flex items-center gap-2">
                                <AlertCircle size={20} />
                                {item.text}
                            </h4>;
                        }
                        if (item.type === 'list-item') {
                            return (
                                <div key={i} className="flex gap-3 items-start">
                                    <div className="mt-1.5 flex-shrink-0">
                                        <CheckCircle2 size={16} className="text-emerald-500" />
                                    </div>
                                    <p className="text-slate-600 leading-relaxed italic">
                                        {item.text}
                                    </p>
                                </div>
                            );
                        }
                        return <p key={i} className="text-slate-600 leading-relaxed">{item.text}</p>;
                    })}
                </div>
            </div>
        ));
    }, [isOpen, reportData?.reportAnalysis]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 p-4 md:p-6 transition-opacity duration-300">
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #CBD5E1;
                }
                /* Hardware acceleration for scrolling optimization */
                .scroll-container-optimized {
                    transform: translateZ(0);
                    will-change: transform;
                    backface-visibility: hidden;
                }
            `}</style>

            <div className="bg-white w-full max-w-5xl h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header code */}
                <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-8 text-white flex items-center justify-between shadow-xl relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-2xl">
                            <FileText size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-extrabold tracking-tight">Detailed Report Analysis</h2>
                            <div className="flex items-center gap-2 text-indigo-100 opacity-90 text-sm mt-1 font-medium bg-white/10 px-3 py-1 rounded-full w-fit">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                {jobRole} • {date}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white/20 hover:rotate-90 rounded-2xl transition-all duration-300 cursor-pointer active:scale-95"
                    >
                        <X size={28} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-16 custom-scrollbar bg-[#F8FAFF] scroll-container-optimized">
                    <div className="max-w-4xl mx-auto space-y-12">
                        <div className="bg-white rounded-[2rem] border border-indigo-50/50 p-8 md:p-12 shadow-sm relative overflow-hidden">
                            <div className="relative z-10">
                                {analysisContent || <p className="text-slate-500 italic text-center py-10">No detailed analysis available.</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white border-t border-slate-100 p-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-400 text-sm font-medium hidden md:block italic">
                        Generated by Shakktii AI Analytics
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-2xl transition-all transform hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-indigo-500/25 cursor-pointer min-w-[240px]"
                        >
                            <FileDown size={22} />
                            Download Detailed Report
                        </button>

                        <button
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all border border-slate-200 cursor-pointer active:scale-95"
                        >
                            <X size={22} />
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
