"use client";

import { useState } from "react";
import { FaChevronDown } from "react-icons/fa6";

interface ExpandableHistoryProps {
  title: string;
  content: string;
  defaultExpanded?: boolean;
}

export default function ExpandableHistory({
  title,
  content,
  defaultExpanded = false,
}: ExpandableHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <FaChevronDown
          className={`w-5 h-5 text-slate-600 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="px-6 py-4 bg-white border-t border-slate-300">
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>
      )}
    </div>
  );
}
