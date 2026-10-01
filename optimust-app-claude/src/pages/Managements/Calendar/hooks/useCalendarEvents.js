import {
  useState,
  useCallback,
} from "react";
import { EMPTY_EVENT } from "../config/constant";

// import { EMPTY_EVENT } from "../constants/eventSchema";

/* ---------------- INITIAL CRM DATA ---------------- */

const INITIAL_DATA = [
  {
    id: "1",

    title: "Call Lead - John Doe",

    description:
      "Discuss pricing and onboarding process with client.",

    start: "2026-05-06T10:00:00",

    end: "2026-05-06T11:00:00",

    type: "task",

    status: "pending",

    priority: "high",

    assignee: "Junaid",

    createdBy: "Manager",

    leadId: "L-101",

    dealId: "D-501",

    company: "Acme Corp",

    contactName: "John Doe",

    contactNumber: "+91 9876543210",

    tags: ["Lead", "Hot"],

    meetingLink: "",

    notes:
      "Client is interested in enterprise plan.",
  },

  {
    id: "2",

    title: "Project Kickoff Meeting",

    description:
      "Internal kickoff with development and design teams.",

    start: "2026-05-07T14:00:00",

    end: "2026-05-07T15:30:00",

    type: "event",

    status: "scheduled",

    priority: "medium",

    assignee: "Team",

    createdBy: "Junaid",

    leadId: "",

    dealId: "D-202",

    company: "Research Activate",

    contactName: "Sarah",

    contactNumber: "+44 777777777",

    tags: ["Meeting"],

    meetingLink:
      "https://meet.google.com/demo",

    notes:
      "Need to finalize milestones.",
  },

  {
    id: "3",

    title: "Client Demo Presentation",

    description:
      "Demo CRM dashboard to potential client.",

    start: "2026-05-08T16:00:00",

    end: "2026-05-08T17:00:00",

    type: "event",

    status: "pending",

    priority: "low",

    assignee: "Junaid",

    createdBy: "Junaid",

    leadId: "L-222",

    dealId: "D-901",

    company: "VIP Number Studio",

    contactName: "Ahmed",

    contactNumber: "+971 8888888",

    tags: ["Demo", "CRM"],

    meetingLink:
      "https://zoom.us/demo",

    notes:
      "Show analytics and automation modules.",
  },

  {
    id: "4",

    title: "Follow-up Payment Reminder",

    description:
      "Reminder to follow up for pending invoice.",

    start: "2026-05-09T09:00:00",

    end: "2026-05-09T09:30:00",

    type: "task",

    status: "done",

    priority: "high",

    assignee: "Accounts",

    createdBy: "Junaid",

    leadId: "",

    dealId: "D-777",

    company: "Bano",

    contactName: "Imran",

    contactNumber: "+91 9999999999",

    tags: ["Finance"],

    meetingLink: "",

    notes:
      "Invoice cleared successfully.",
  },

  {
    id: "5",

    title: "UI/UX Review Session",

    description:
      "Review latest dashboard UI improvements.",

    start: "2026-05-10T13:00:00",

    end: "2026-05-10T14:00:00",

    type: "event",

    status: "scheduled",

    priority: "medium",

    assignee: "Design Team",

    createdBy: "Junaid",

    leadId: "",

    dealId: "",

    company: "Internal",

    contactName: "UI Team",

    contactNumber: "",

    tags: ["UI", "Review"],

    meetingLink:
      "https://meet.google.com/ui",

    notes:
      "Focus on responsiveness and usability.",
  },

  {
  id: "6",

  title: "Sales Follow-up",

  description:
    "Follow-up discussion regarding proposal approval.",

  start: "2026-05-07T10:00:00",

  end: "2026-05-07T11:00:00",

  type: "task",

  status: "pending",

  priority: "high",

  assignee: "Junaid",

  createdBy: "Manager",

  leadId: "L-890",

  dealId: "D-120",

  company: "Acme Corp",

  contactName: "Rahul",

  contactNumber: "+91 9876543200",

  tags: ["Follow-up"],

  meetingLink: "",

  notes:
    "Need final confirmation from client.",
},
{
  id: "7",

  title: "Team Standup",

  description:
    "Daily sync-up with development team.",

  start: "2026-05-07T10:30:00",

  end: "2026-05-07T11:30:00",

  type: "event",

  status: "scheduled",

  priority: "medium",

  assignee: "Team",

  createdBy: "Junaid",

  leadId: "",

  dealId: "",

  company: "Internal",

  contactName: "Dev Team",

  contactNumber: "",

  tags: ["Standup"],

  meetingLink:
    "https://meet.google.com/team",

  notes:
    "Discuss blockers and sprint progress.",
},
{
  id: "8",

  title: "Product Review",

  description:
    "Review latest CRM UI implementation.",

  start: "2026-05-07T10:15:00",

  end: "2026-05-07T11:00:00",

  type: "event",

  status: "scheduled",

  priority: "low",

  assignee: "Design Team",

  createdBy: "Junaid",

  leadId: "",

  dealId: "",

  company: "Internal",

  contactName: "UI Team",

  contactNumber: "",

  tags: ["Review"],

  meetingLink:
    "https://zoom.us/review",

  notes:
    "Focus on UX improvements.",
},
];

/* ---------------- HOOK ---------------- */

export const useCalendarEvents = () => {
  const [events, setEvents] =
    useState(INITIAL_DATA);

  const [selectedEvent, setSelectedEvent] =
    useState(null);

  const [isCreating, setIsCreating] =
    useState(false);

  /* ---------------- OPEN CREATE ---------------- */

  const openCreate = useCallback((range) => {
    setIsCreating(true);

    setSelectedEvent({
      id: Date.now().toString(),

      ...EMPTY_EVENT,

      start: range.start,

      end: range.end,

      createdBy: "Junaid",
    });
  }, []);

  /* ---------------- OPEN EDIT ---------------- */

  const openEdit = useCallback((event) => {
    setIsCreating(false);

    setSelectedEvent(event);
  }, []);

  /* ---------------- CLOSE ---------------- */

  const closeDrawer = useCallback(() => {
    setSelectedEvent(null);

    setIsCreating(false);
  }, []);

  /* ---------------- SAVE ---------------- */

  const saveEvent = useCallback(
    (updatedEvent) => {
      setEvents((prev) => {
        const exists = prev.some(
          (e) => e.id === updatedEvent.id
        );

        if (exists) {
          return prev.map((e) =>
            e.id === updatedEvent.id
              ? updatedEvent
              : e
          );
        }

        return [
          ...prev,
          updatedEvent,
        ];
      });

      closeDrawer();
    },

    [closeDrawer]
  );

  /* ---------------- DELETE ---------------- */

  const deleteEvent = useCallback(
    (id) => {
      setEvents((prev) =>
        prev.filter((e) => e.id !== id)
      );

      closeDrawer();
    },

    [closeDrawer]
  );

  return {
    events,

    selectedEvent,

    isCreating,

    openCreate,

    openEdit,

    closeDrawer,

    saveEvent,

    deleteEvent,
  };
};