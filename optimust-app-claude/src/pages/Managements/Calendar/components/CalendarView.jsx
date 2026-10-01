// import React, {
//   memo,
//   useCallback,
// } from "react";

// import FullCalendar from "@fullcalendar/react";

// import timeGridPlugin from "@fullcalendar/timegrid";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import listPlugin from "@fullcalendar/list";

// import { CALENDAR_CONFIG } from "../config/calendarConfig";

// function CalendarView({
//   events,
//   onCreate,
//   onEdit,
//   onDrop,
// }) {
//   /* ---------------- EVENT COLORS ---------------- */

//   const eventClassNames =
//     useCallback((arg) => {
//       const priority =
//         arg.event.extendedProps
//           .priority;

//       return [
//         CALENDAR_CONFIG.priorities[
//           priority
//         ]?.className,
//       ];
//     }, []);

//   /* ---------------- EVENT CONTENT ---------------- */

//   const renderEventContent =
//     useCallback((arg) => {
//       const event = arg.event;

//       const priority =
//         event.extendedProps.priority;

//       return (
//         <div className="h-full overflow-hidden rounded-md px-1 py-[2px]">
//           {/* TITLE */}

//           <div className="flex items-center gap-1">
//             <div
//               className={`h-2 w-2 shrink-0 rounded-full ${
//                 priority === "high"
//                   ? "bg-red-500"
//                   : priority ===
//                     "medium"
//                   ? "bg-yellow-500"
//                   : "bg-green-500"
//               }`}
//             />

//             <div className="truncate text-[11px] font-semibold">
//               {event.title}
//             </div>
//           </div>

//           {/* ASSIGNEE */}

//           <div className="truncate text-[10px] opacity-70">
//             👤{" "}
//             {
//               event.extendedProps
//                 .assignee
//             }
//           </div>
//         </div>
//       );
//     }, []);

//   return (
//     <div className="flex-1 min-w-0 p-3 overflow-hidden">
//       <div className="h-full rounded-2xl bg-white p-3 shadow-sm">
//         <FullCalendar
//           plugins={[
//             timeGridPlugin,
//             dayGridPlugin,
//             interactionPlugin,
//             listPlugin,
//           ]}
//           initialView="timeGridWeek"
//           selectable
//           editable
//           nowIndicator
//           dayMaxEvents
//           dayMaxEventRows={3}
//           eventMaxStack={3}
//           slotEventOverlap={false}
//           rerenderDelay={10}
//           height="100%"
//           events={events}
//           select={(info) =>
//             onCreate({
//               start: info.start,
//               end: info.end,
//             })
//           }
//           eventClick={(info) =>
//             onEdit({
//               ...info.event.extendedProps,

//               id: info.event.id,

//               title:
//                 info.event.title,

//               start:
//                 info.event.start,

//               end: info.event.end,
//             })
//           }
//           eventDrop={onDrop}
//           eventResize={onDrop}
//           eventContent={
//             renderEventContent
//           }
//           eventClassNames={
//             eventClassNames
//           }
//           headerToolbar={{
//             left: "prev,next today",

//             center: "title",

//             right:
//               "timeGridDay,timeGridWeek,dayGridMonth,listWeek",
//           }}
//         />
//       </div>
//     </div>
//   );
// }

// export default memo(CalendarView);


import React, {
  memo,
  useCallback,
} from "react";

import FullCalendar from "@fullcalendar/react";

import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

import { CALENDAR_CONFIG } from "../config/calendarConfig";

function CalendarView({
  events,
  onCreate,
  onEdit,
}) {
  /* ---------------- EVENT COLORS ---------------- */

  const eventClassNames =
    useCallback((arg) => {
      const priority =
        arg.event.extendedProps
          .priority;

      return [
        CALENDAR_CONFIG.priorities[
          priority
        ]?.className,
      ];
    }, []);

  /* ---------------- EVENT UI ---------------- */

  const renderEventContent =
    useCallback((arg) => {
      const event = arg.event;

      const priority =
        event.extendedProps.priority;

      return (
        <div className="h-full overflow-hidden rounded-md px-1 py-[2px]">
          <div className="flex items-center gap-1">
            <div
              className={`h-2 w-2 rounded-full shrink-0 ${
                priority === "high"
                  ? "bg-red-500"
                  : priority === "medium"
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
            />

            <div className="truncate text-[11px] font-semibold">
              {event.title}
            </div>
          </div>

          <div className="truncate text-[10px] opacity-70">
            {
              event.extendedProps
                .assignee
            }
          </div>
        </div>
      );
    }, []);

  return (
    <div className="flex-1 min-w-0 p-3 overflow-auto">
      <div className="h-full rounded-2xl bg-white p-3 shadow-sm">
        <FullCalendar
          plugins={[
            timeGridPlugin,
            dayGridPlugin,
            interactionPlugin,
            listPlugin,
          ]}
          initialView="timeGridWeek"
          selectable
          editable
          nowIndicator
          rerenderDelay={10}
          height="100%"
          events={events}
          dayMaxEvents
          dayMaxEventRows={3}
          eventMaxStack={3}
          slotEventOverlap={false}
          select={(info) =>
            onCreate({
              start: info.start,
              end: info.end,
            })
          }
          eventClick={(info) =>
            onEdit({
              ...info.event.extendedProps,

              id: info.event.id,

              title:
                info.event.title,

              start:
                info.event.start,

              end: info.event.end,
            })
          }
          eventContent={
            renderEventContent
          }
          eventClassNames={
            eventClassNames
          }
          headerToolbar={{
            left: "prev,next today",

            center: "title",

            right:
              "timeGridDay,timeGridWeek,dayGridMonth,listMonth",
          }}
        />
      </div>
    </div>
  );
}

export default memo(CalendarView);