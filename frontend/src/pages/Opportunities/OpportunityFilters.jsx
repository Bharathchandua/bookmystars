import PagesButton from "../common/PagesButton";
import { ChevronDown, XCircle } from "lucide-react";

const FILTERS = [
  "Category",
  "Role Type",
  "Location",
  "Experience Level",
  "Budget",
  "Date Posted",
];

export default function OpportunityFilters() {
  return (
    <div className="opp-filter-row">
      {FILTERS.map((f) => (
        <PagesButton key={f} className="opp-filter-dd">
          {f}
          <ChevronDown size={14} />
        </PagesButton>
      ))}
      <PagesButton className="opp-clear-btn">
        <XCircle size={14} />
        Clear All
      </PagesButton>
    </div>
  );
}
