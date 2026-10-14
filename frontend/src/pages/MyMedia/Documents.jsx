import PagesButton from "../common/PagesButton";
import { useState, useEffect } from "react";
import { FileText, MoreVertical, Plus, Trash2, Download, Eye, File, ExternalLink } from "lucide-react";
import { getFullImageUrl } from "../../services/api";

export default function Documents({ documents, onUploadClick, onDeleteDocument }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  const handleAction = (actionFn, item) => {
    actionFn(item);
    setActiveMenu(null);
  };

  const getDocIcon = (format = "PDF") => {
    switch (format.toUpperCase()) {
      case "PDF":
        return <div className="doc-icon-box pdf-bg"><span className="doc-format-label">PDF</span></div>;
      case "DOCX":
      case "DOC":
        return <div className="doc-icon-box docx-bg"><span className="doc-format-label">DOC</span></div>;
      case "PPTX":
      case "PPT":
        return <div className="doc-icon-box pptx-bg"><span className="doc-format-label">PPT</span></div>;
      default:
        return <div className="doc-icon-box generic-bg"><File size={22} /></div>;
    }
  };

  useEffect(() => {
    const clickAway = () => setActiveMenu(null);
    document.addEventListener("click", clickAway);
    return () => document.removeEventListener("click", clickAway);
  }, []);

  return (
    <div className="media-section-container">
      <div className="media-section-grid documents-grid">
        {documents.map((doc) => {
          const fileUrl = getFullImageUrl(doc.fileUrl);

          return (
            <div key={doc.id} className="media-card document-card" onClick={() => setViewingDoc(doc)}>
              <div className="document-card-top-row">
                {getDocIcon(doc.format)}
                
                {/* Three dots menu */}
                <div className="relative">
                  <PagesButton 
                    className="media-card-menu-btn doc-menu-btn"
                    onClick={(e) => toggleMenu(e, doc.id)}
                    aria-label="Document Actions"
                  >
                    <MoreVertical size={16} />
                  </PagesButton>

                  {activeMenu === doc.id && (
                    <div className="media-dropdown-menu doc-dropdown" onClick={(e) => e.stopPropagation()}>
                      {fileUrl && (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="media-dropdown-item"
                          style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "8px" }}
                          onClick={() => setActiveMenu(null)}
                        >
                          <Eye size={14} /> View File
                        </a>
                      )}
                      {fileUrl && (
                        <a
                          href={fileUrl}
                          download={`${doc.title || "document"}.${(doc.format || "pdf").toLowerCase()}`}
                          className="media-dropdown-item"
                          style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "8px" }}
                          onClick={() => setActiveMenu(null)}
                        >
                          <Download size={14} /> Download
                        </a>
                      )}
                      <PagesButton className="media-dropdown-item danger" onClick={() => handleAction(onDeleteDocument, doc.id)}>
                        <Trash2 size={14} /> Delete
                      </PagesButton>
                    </div>
                  )}
                </div>
              </div>

              <div className="document-card-info">
                <h4 className="document-card-title">{doc.title}</h4>
                <div className="document-card-meta">
                  <span>{doc.format || "PDF"} • {doc.sizeStr || doc.size || "1.2 MB"}</span>
                  <span className="doc-updated-time">{doc.date || "Recently"}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Upload Documents Box */}
        <div className="media-card upload-placeholder-card document-upload-card" onClick={onUploadClick}>
          <div className="upload-placeholder-content">
            <div className="upload-plus-circle">
              <Plus size={20} className="text-pink-600" />
            </div>
            <h4 className="upload-placeholder-title">Upload Documents</h4>
            <p className="upload-placeholder-subtitle">PDF, DOCX, PPTX</p>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDoc && (
        <div className="video-player-modal-overlay" onClick={() => setViewingDoc(null)}>
          <div className="video-player-modal-content document-viewer-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px", padding: "24px", background: "#ffffff", borderRadius: "16px" }}>
            <div className="video-player-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>{viewingDoc.title}</h3>
              <PagesButton className="video-player-close-btn" onClick={() => setViewingDoc(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>&times;</PagesButton>
            </div>
            
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#eff6ff", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <FileText size={32} />
              </div>
              <h4 style={{ margin: "0 0 6px 0", fontSize: "15px" }}>{viewingDoc.title}</h4>
              <p style={{ margin: "0 0 20px 0", fontSize: "12px", color: "#64748b" }}>
                Format: {viewingDoc.format || "PDF"} • Size: {viewingDoc.sizeStr || viewingDoc.size || "1.2 MB"} • Category: {viewingDoc.category || "General"}
              </p>

              <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                {viewingDoc.fileUrl && (
                  <a
                    href={getFullImageUrl(viewingDoc.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: "#e91e8c", color: "#fff", textDecoration: "none",
                      padding: "10px 20px", borderRadius: "8px", fontWeight: "600", fontSize: "13px",
                      display: "flex", alignItems: "center", gap: "6px"
                    }}
                  >
                    <ExternalLink size={14} /> Open Document
                  </a>
                )}
                {viewingDoc.fileUrl && (
                  <a
                    href={getFullImageUrl(viewingDoc.fileUrl)}
                    download={`${viewingDoc.title || "document"}.${(viewingDoc.format || "pdf").toLowerCase()}`}
                    style={{
                      backgroundColor: "#f1f5f9", color: "#334155", textDecoration: "none",
                      padding: "10px 18px", borderRadius: "8px", fontWeight: "600", fontSize: "13px",
                      display: "flex", alignItems: "center", gap: "6px"
                    }}
                  >
                    <Download size={14} /> Download
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
