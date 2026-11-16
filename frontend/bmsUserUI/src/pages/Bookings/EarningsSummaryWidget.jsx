import PagesButton from "../common/PagesButton";
import { useState } from "react";
import { Wallet, X, TrendingUp, TrendingDown } from "lucide-react";

export default function EarningsSummaryWidget({
  paidAmount = 0,
  pendingAmount = 0,
  cancelledAmount = 0,
  monthlyBreakdown = []
}) {
  const [showPanel, setShowPanel] = useState(false);

  const formatCurr = (val) => {
    if (!val || isNaN(val)) return "₹ 0";
    return "₹ " + Number(val).toLocaleString("en-IN");
  };

  const totalEarned = paidAmount + pendingAmount;

  const breakdown = [
    { label: "Paid",               value: formatCurr(paidAmount),      dotClass: "paid" },
    { label: "Pending",            value: formatCurr(pendingAmount),   dotClass: "pending" },
    { label: "Cancelled/Refunded", value: formatCurr(cancelledAmount), dotClass: "cancelled" },
  ];

  const currentMonthName = new Date().toLocaleString("en-IN", { month: "long", year: "numeric" });
  const displayMonthly = monthlyBreakdown.length > 0 ? monthlyBreakdown : [
    { month: currentMonthName, paid: formatCurr(paidAmount), pending: formatCurr(pendingAmount), cancelled: formatCurr(cancelledAmount) }
  ];

  return (
    <div className="opp-widget" style={{ position: "relative", overflow: "visible" }}>
      {/* Header */}
      <div className="earnings-widget-head">
        <span className="opp-widget-head-title">Earnings Summary</span>
        <PagesButton
          className="opp-widget-view-all"
          onClick={() => setShowPanel(true)}
        >
          View All
        </PagesButton>
      </div>

      {/* Main earnings value */}
      <div className="earnings-main-val">
        <span className="earnings-label">Total Earnings</span>
        <div className="earnings-row-flex">
          <div>
            <div className="earnings-amount">{formatCurr(totalEarned)}</div>
            <div className="earnings-growth" style={{ color: "#16a34a" }}>Live Database Totals</div>
          </div>
          <div className="earnings-wallet-icon">
            <Wallet size={20} />
          </div>
        </div>
      </div>

      {/* List breakdown */}
      <div className="earnings-breakdown-list">
        {breakdown.map((item, index) => (
          <div key={index} className="earnings-breakdown-row">
            <span className="earnings-breakdown-label">
              <span className={`earnings-breakdown-dot ${item.dotClass}`} />
              {item.label}
            </span>
            <span className="earnings-breakdown-val">{item.value}</span>
          </div>
        ))}
      </div>

      {/* View All Modal Overlay */}
      {showPanel && (
        <div className="earnings-panel-overlay" onClick={() => setShowPanel(false)}>
          <div
            className="earnings-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="earnings-panel-header">
              <div>
                <h3 className="earnings-panel-title">Earnings Breakdown</h3>
                <p className="earnings-panel-subtitle">Monthly earnings overview</p>
              </div>
              <PagesButton
                className="earnings-panel-close"
                onClick={() => setShowPanel(false)}
              >
                <X size={18} />
              </PagesButton>
            </div>

            {/* Summary Stats */}
            <div className="earnings-panel-stats">
              <div className="earnings-panel-stat">
                <span className="earnings-panel-stat-label">Total Earned</span>
                <span className="earnings-panel-stat-val">{formatCurr(totalEarned)}</span>
                <span className="earnings-panel-stat-trend" style={{ color: "#16a34a" }}>
                  <TrendingUp size={12} /> Confirmed & Active
                </span>
              </div>
              <div className="earnings-panel-stat">
                <span className="earnings-panel-stat-label">Pending</span>
                <span className="earnings-panel-stat-val" style={{ color: "#d97706" }}>{formatCurr(pendingAmount)}</span>
                <span className="earnings-panel-stat-trend" style={{ color: "#64748b" }}>Awaiting response</span>
              </div>
              <div className="earnings-panel-stat">
                <span className="earnings-panel-stat-label">Cancelled</span>
                <span className="earnings-panel-stat-val" style={{ color: "#dc2626" }}>{formatCurr(cancelledAmount)}</span>
                <span className="earnings-panel-stat-trend" style={{ color: "#64748b" }}>
                  <TrendingDown size={12} /> Declined / Cancelled
                </span>
              </div>
            </div>

            {/* Monthly Table */}
            <div className="earnings-panel-table-wrap">
              <table className="earnings-panel-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Paid / Confirmed</th>
                    <th>Pending</th>
                    <th>Cancelled</th>
                  </tr>
                </thead>
                <tbody>
                  {displayMonthly.map((row, i) => (
                    <tr key={i}>
                      <td>{row.month}</td>
                      <td style={{ color: "#16a34a", fontWeight: 700 }}>{row.paid}</td>
                      <td style={{ color: "#d97706", fontWeight: 600 }}>{row.pending}</td>
                      <td style={{ color: "#dc2626", fontWeight: 600 }}>{row.cancelled}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
