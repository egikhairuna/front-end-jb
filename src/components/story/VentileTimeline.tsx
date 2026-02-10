"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  date: string;
  label: string;
  year: number;
  monthIndex: number; // 0-11
}

const EVENTS: TimelineEvent[] = [
  { date: "22 November 2022", label: "Develop the fabrics", year: 2022, monthIndex: 10 },
  { date: "13 May 2023", label: "Coloring the fabrics", year: 2023, monthIndex: 4 },
  { date: "07 June 2023", label: "Develop accessories", year: 2023, monthIndex: 5 },
  { date: "12 Feb 2024", label: "Develop the product", year: 2024, monthIndex: 1 },
  { date: "06 August 2024", label: "Final develop", year: 2024, monthIndex: 7 },
  { date: "16 September 2024", label: "Content production", year: 2024, monthIndex: 8 },
  { date: "01 October 2024", label: "Release", year: 2024, monthIndex: 9 },
];

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const YEARS = [2022, 2023, 2024, 2025];

export const VentileTimeline: React.FC = () => {
  const totalMonths = 38;
  const monthWidth = 32;
  const rightColumnWidth = 450;
  const timelineHeight = 550;
  const bottomAxisHeight = 60;
  
  const getMonthAbsoluteIndex = (year: number, monthIndex: number) => {
    const yearOffset = (year - 2022) * 12;
    return yearOffset + monthIndex;
  };

  const timelineContentWidth = totalMonths * monthWidth;
  const totalWidth = timelineContentWidth + rightColumnWidth;

  return (
    <div className="bg-white text-black font-sans selection:bg-black selection:text-white pb-12 w-full">
      
      {/* MOBILE VERSION (Vertical Stack) */}
      <div className="md:hidden space-y-12">
        {/* Title for Mobile */}
        <div className="mb-12">
          <h2 className="text-4xl font-extrabold uppercase leading-[0.8] tracking-tighter">
            JAMES BOOGIE<br />
            VENTILE®<br />
            TIME<br />
            LINE
          </h2>
        </div>

        <div className="relative pl-8 border-l border-black space-y-16">
          {EVENTS.map((event, index) => (
            <div key={index} className="relative">
              {/* Dot on the vertical line */}
              <div className="absolute -left-[36px] top-1 w-4 h-4 rounded-full border-2 border-black bg-white z-10" />
              <div className="absolute -left-[32px] top-[14px] w-[24px] h-[1px] bg-black" />

              <div>
                <p className="text-[10px] font-bold text-black/40 mb-1">
                  {event.date}
                </p>
                <h3 className="text-[20px] font-black uppercase tracking-tighter leading-tight">
                  {event.label}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP VERSION (Refined Horizontal) */}
      <div className="hidden md:block overflow-x-auto scrollbar-hide">
        <div className="min-w-max pr-24" style={{ width: totalWidth + 100 }}>
          
          {/* Title Stacked on the Left */}
          <div className="mb-12 w-max">
            <h2 className="text-5xl font-extrabold uppercase leading-[0.8] tracking-tighter">
              JAMES BOOGIE<br />
              VENTILE®<br />
              TIME<br />
              LINE
            </h2>
          </div>

          <div className="relative" style={{ height: timelineHeight }}>
            
            {/* Main Content: Lines and Labels */}
            <div className="absolute inset-x-0 bottom-[60px]" style={{ height: timelineHeight - bottomAxisHeight }}>
              {EVENTS.map((event, index) => {
                const absIdx = getMonthAbsoluteIndex(event.year, event.monthIndex);
                const xPos = absIdx * monthWidth + monthWidth / 2;
                
                const verticalLevel = index; 
                const horizontalLineY = verticalLevel * 55 + 20; 
                const labelXStart = timelineContentWidth + 40;

                return (
                  <div key={index}>
                    {/* Vertical Line Segment */}
                    <div 
                      className="absolute bg-black"
                      style={{
                        left: xPos,
                        top: horizontalLineY,
                        width: '1px',
                        height: (timelineHeight - bottomAxisHeight) - horizontalLineY
                      }}
                    />

                    {/* Horizontal Line Segment */}
                    <div 
                      className="absolute bg-black"
                      style={{
                        left: xPos,
                        top: horizontalLineY,
                        height: '1px',
                        width: labelXStart - xPos
                      }}
                    />

                    {/* Dot on the Axis */}
                    <div 
                      className="absolute bg-black rounded-full"
                      style={{
                        left: xPos - 3,
                        bottom: -3,
                        width: 6,
                        height: 6
                      }}
                    />

                    {/* Circle Pin on Label Intersection */}
                    <div 
                      className="absolute bg-white border-2 border-black rounded-full"
                      style={{
                        left: labelXStart - 4,
                        top: horizontalLineY - 4,
                        width: 8,
                        height: 8
                      }}
                    />

                    {/* Event Label */}
                    <div 
                      className="absolute"
                      style={{
                        left: labelXStart + 16,
                        top: horizontalLineY - 18,
                        width: rightColumnWidth - 60
                      }}
                    >
                      <p className="text-[10px] font-bold text-black/40 mb-1">
                        {event.date}
                      </p>
                      <h3 className="text-[20px] font-black uppercase tracking-tighter leading-none whitespace-nowrap">
                        {event.label}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Axis: Years and Months */}
            <div className="absolute bottom-0 left-0 w-full flex items-end h-[60px] border-t border-black">
              <div className="flex h-full" style={{ width: timelineContentWidth }}>
                {YEARS.map((year) => (
                  <div key={year} className="flex h-full">
                    {MONTHS.map((month, mIdx) => {
                      const absIdx = getMonthAbsoluteIndex(year, mIdx);
                      if (absIdx >= totalMonths) return null;
                      
                      return (
                        <div 
                          key={`${year}-${month}`} 
                          className="relative h-full flex flex-col items-center justify-end pb-2"
                          style={{ width: monthWidth }}
                        >
                          {/* Year Label */}
                          {mIdx === 0 && (
                            <span className="absolute bottom-12 -left-2 text-[11px] font-black uppercase">
                              {year}
                            </span>
                          )}
                          
                          {/* Month Label */}
                          <span className="-rotate-90 text-[10px] font-bold origin-center whitespace-nowrap">
                            {month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
