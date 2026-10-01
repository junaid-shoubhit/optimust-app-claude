import {
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  UserX,
  Hourglass,
} from "lucide-react";

export const DEFAULT_FILTERS = {
  page: 1,
  pageSize: 50,
  filters: [],
  sortCriteria: [],
};

export const STATUS_THEME = {
  wIP: {
    icon: Clock,
    text: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
    hover: "hover:bg-sky-100 hover:border-sky-300",
  },
  assigned: {
    icon: UserCheck,
    text: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    hover: "hover:bg-indigo-100 hover:border-indigo-300",
  },
  completed: {
    icon: CheckCircle2,
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    hover: "hover:bg-emerald-100 hover:border-emerald-300",
  },
  canceled: {
    icon: XCircle,
    text: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    hover: "hover:bg-rose-100 hover:border-rose-300",
  },
  "not Assigned": {
    icon: UserX,
    text: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
    hover: "hover:bg-slate-100 hover:border-slate-300",
  },
  pending: {
    icon: Hourglass,
    text: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    hover: "hover:bg-amber-100 hover:border-amber-300",
  },
};

export const TOLERANCE_THEME = {
  "tolerance Greather than Days": {
    text: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    hover: "hover:bg-rose-100",
  },
  "today Total": {
    text: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    hover: "hover:bg-blue-100",
  },
  "30 Less than Days": {
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    hover: "hover:bg-emerald-100",
  },
  "30 Plus Days": {
    text: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    hover: "hover:bg-amber-100",
  },
  "45 Plus Days": {
    text: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    hover: "hover:bg-orange-100",
  },
  "60 Plus Days": {
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    hover: "hover:bg-red-100",
  },
};
