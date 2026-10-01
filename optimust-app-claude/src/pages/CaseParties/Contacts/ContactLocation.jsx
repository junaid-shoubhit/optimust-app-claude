import { memo } from "react";
import { MapPin } from "lucide-react";
import CopyButton from "./CopyButton";

const ContactLocation = memo(({ address }) => (
  <div className="mt-3 border-t border-slate-200 pt-3">
    <div className="mb-1 flex items-center justify-between">
      <span className="flex items-center gap-1 font-mono text-[9px] uppercase text-slate-500">
        <MapPin size={10} />
        Location
      </span>

      <CopyButton value={address} label="address" />
    </div>

    <p className="text-xs font-medium">{address || "No address on file."}</p>
  </div>
));

export default ContactLocation;
