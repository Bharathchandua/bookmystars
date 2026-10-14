import PagesButton from "../common/PagesButton";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function OpportunityPagination({ currentPage, setCurrentPage, totalPages = 16 }) {
  const pages = [1, 2, 3, 4, 5];

  return (
    <div className="opp-pagination">
      {/* Prev */}
      <PagesButton
        className="opp-page-btn arrow"
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={14} />
      </PagesButton>

      {/* Page numbers */}
      {pages.map((p) => (
        <PagesButton
          key={p}
          className={`opp-page-btn ${currentPage === p ? "active" : ""}`}
          onClick={() => setCurrentPage(p)}
        >
          {p}
        </PagesButton>
      ))}

      {/* Ellipsis */}
      <PagesButton className="opp-page-btn dots">···</PagesButton>

      {/* Last page */}
      <PagesButton
        className={`opp-page-btn ${currentPage === totalPages ? "active" : ""}`}
        onClick={() => setCurrentPage(totalPages)}
      >
        {totalPages}
      </PagesButton>

      {/* Next */}
      <PagesButton
        className="opp-page-btn arrow"
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={14} />
      </PagesButton>
    </div>
  );
}
