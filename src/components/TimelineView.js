import React, { useMemo } from 'react';

const TimelineView = ({ groupedAllocations, selectedYear }) => {
     const yearDays = useMemo(() => {
          const days = [];
          const startDate = new Date(selectedYear, 0, 1);

          for (let i = 0; i < 365; i++) {
               const date = new Date(startDate);
               date.setDate(date.getDate() + i);
               days.push(date);
          }

          return days;
     }, [selectedYear]);

     const calculateLanes = (allocations) => {
          if (allocations.length === 0) return { lanes: [], maxLanes: 1 };

          const sorted = [...allocations].sort((a, b) => a.startDate - b.startDate);
          const lanes = [];
          const laneAssignments = new Map();

          sorted.forEach(allocation => {
               let assignedLane = 0;
               let placed = false;

               while (!placed) {
                    const overlaps = Array.from(laneAssignments.entries()).some(([otherAlloc, lane]) => {
                         if (lane !== assignedLane) return false;

                         const otherStart = otherAlloc.startDate.getTime();
                         const otherEnd = otherAlloc.endDate.getTime();
                         const thisStart = allocation.startDate.getTime();
                         const thisEnd = allocation.endDate.getTime();

                         return (thisStart < otherEnd && thisEnd > otherStart);
                    });

                    if (!overlaps) {
                         laneAssignments.set(allocation, assignedLane);
                         placed = true;
                    } else {
                         assignedLane++;
                    }
               }
          });

          const maxLanes = Math.max(...Array.from(laneAssignments.values())) + 1;

          for (let i = 0; i < maxLanes; i++) {
               lanes[i] = [];
          }

          laneAssignments.forEach((lane, allocation) => {
               lanes[lane].push(allocation);
          });

          return { lanes, maxLanes };
     };

     const getMilestonePosition = (allocation) => {
          const yearStart = new Date(selectedYear, 0, 1);
          const startDay = Math.floor((allocation.startDate - yearStart) / (1000 * 60 * 60 * 24));
          const endDay = Math.floor((allocation.endDate - yearStart) / (1000 * 60 * 60 * 24));

          if (endDay < 0 || startDay >= 365) return null;

          const clippedStart = Math.max(0, startDay);
          const clippedEnd = Math.min(364, endDay);
          const width = clippedEnd - clippedStart + 1;

          return {
               left: `${(clippedStart / 365) * 100}%`,
               width: `${(width / 365) * 100}%`
          };
     };

     const clientColors = useMemo(() => {
          const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
          const colorMap = {};
          let colorIndex = 0;

          Object.values(groupedAllocations).forEach(resourceTypeGroup => {
               Object.values(resourceTypeGroup).forEach(resourceData => {
                    resourceData.allocations.forEach(allocation => {
                         if (!colorMap[allocation.clientId]) {
                              colorMap[allocation.clientId] = colors[colorIndex % colors.length];
                              colorIndex++;
                         }
                    });
               });
          });

          return colorMap;
     }, [groupedAllocations]);

     return (
          <div className="timeline">
               <div className="timeline-header">
                    <div className="resource-labels-header">Resource</div>
                    <div className="timeline-days">
                         {yearDays.map((date, i) => {
                              const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
                              const month = date.getMonth() + 1;
                              const day = date.getDate();

                              return (
                                   <div key={i} className="day-label" title={date.toLocaleDateString()}>
                                        <div className="day-date">{month}/{day}</div>
                                        <div className="day-name">{dayOfWeek}</div>
                                   </div>
                              );
                         })}
                    </div>
               </div>

               <div className="timeline-body">
                    {Object.entries(groupedAllocations).length === 0 ? (
                         <div className="no-data">No allocations found for selected filters</div>
                    ) : (
                         Object.entries(groupedAllocations).map(([resourceType, resourcesInType]) => (
                              <div key={resourceType} className="resource-type-group">
                                   <div className="resource-type-header">{resourceType}</div>

                                   {Object.entries(resourcesInType).map(([resourceId, resourceData]) => {
                                        const { lanes, maxLanes } = calculateLanes(resourceData.allocations);
                                        const rowHeight = maxLanes * 50;

                                        return (
                                             <div key={resourceId} className="resource-row" style={{ minHeight: `${rowHeight}px` }}>
                                                  <div className="resource-label" style={{ minHeight: `${rowHeight}px` }}>
                                                       {resourceData.resourceName}
                                                  </div>
                                                  <div className="timeline-bars" style={{ minHeight: `${rowHeight}px` }}>
                                                       {lanes.map((laneAllocations, laneIndex) => (
                                                            <div key={laneIndex} className="timeline-lane" style={{ top: `${laneIndex * 50}px` }}>
                                                                 {laneAllocations.map(allocation => {
                                                                      const position = getMilestonePosition(allocation);
                                                                      if (!position) return null;

                                                                      return (
                                                                           <div
                                                                                key={allocation.id}
                                                                                className="milestone-bar"
                                                                                style={{
                                                                                     ...position,
                                                                                     backgroundColor: clientColors[allocation.clientId]
                                                                                }}
                                                                                title={`${allocation.clientName} - ${allocation.milestoneName}\n${allocation.startDate.toLocaleDateString()} - ${allocation.endDate.toLocaleDateString()}`}
                                                                           >
                                                                                <span className="milestone-label">
                                                                                     {allocation.clientName.substring(0, 15)}... - {allocation.milestoneName}
                                                                                </span>
                                                                           </div>
                                                                      );
                                                                 })}
                                                            </div>
                                                       ))}
                                                  </div>
                                             </div>
                                        );
                                   })}
                              </div>
                         ))
                    )}
               </div>
          </div>
     );
};

export default TimelineView;