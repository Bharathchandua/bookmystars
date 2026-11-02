import PagesButton from "../common/PagesButton";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function OpportunityPagination({ currentPage, setCurrentPage, totalPages = 1 }) {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  // Generate dynamic array of visible page numbers
  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="opp-pagination">
      {/* Prev */}
      <PagesButton
        className="opp-page-btn arrow"
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        aria-label="Previous Page"
      >
        <ChevronLeft size={14} />
      </PagesButton>

      {/* First Page shortcut if distant */}
      {startPage > 1 && (
        <>
          <PagesButton
            className={`opp-page-btn ${currentPage === 1 ? "active" : ""}`}
            onClick={() => setCurrentPage(1)}
          >
            1
          </PagesButton>
          {startPage > 2 && <PagesButton className="opp-page-btn dots">···</PagesButton>}
        </>
      )}

      {/* Dynamic page numbers */}
      {pages.map((p) => (
        <PagesButton
          key={p}
          className={`opp-page-btn ${currentPage === p ? "active" : ""}`}
          onClick={() => setCurrentPage(p)}
        >
          {p}
        </PagesButton>
      ))}

      {/* Last page shortcut if distant */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <PagesButton className="opp-page-btn dots">···</PagesButton>}
          <PagesButton
            className={`opp-page-btn ${currentPage === totalPages ? "active" : ""}`}
            onClick={() => setCurrentPage(totalPages)}
          >
            {totalPages}
          </PagesButton>
        </>
      )}

      {/* Next */}
      <PagesButton
        className="opp-page-btn arrow"
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        aria-label="Next Page"
      >
        <ChevronRight size={14} />
      </PagesButton>
    </div>
  );
}
