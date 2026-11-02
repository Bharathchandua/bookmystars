import PagesButton from "../common/PagesButton";
import { useState } from "react";
import { Wallet, X, TrendingUp, TrendingDown } from "lucide-react";

const ALL_EARNINGS = [
  { month: "January 2024",  paid: "₹ 8,00,000",  pending: "₹ 0",       cancelled: "₹ 0" },
  { month: "February 2024", paid: "₹ 10,50,000", pending: "₹ 0",       cancelled: "₹ 50,000" },
  { month: "March 2024",    paid: "₹ 12,00,000", pending: "₹ 1,50,000",cancelled: "₹ 25,000" },
  { month: "April 2024",    paid: "₹ 14,60,000", pending: "₹ 2,40,000",cancelled: "₹ 0" },
  { month: "May 2024",      paid: "₹ 19,00,000", pending: "₹ 2,50,000",cancelled: "₹ 1,00,000" },
];

export default function EarningsSummaryWidget() {
  const [showPanel, setShowPanel] = useState(false);

  const breakdown = [
    { label: "Paid",               value: "₹ 64,10,000", dotClass: "paid" },
    { label: "Pending",            value: "₹ 6,40,000",  dotClass: "pending" },
    { label: "Cancelled/Refunded", value: "₹ 1,75,000",  dotClass: "cancelled" },
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
            <div className="earnings-amount">₹ 72,25,000</div>
            <div className="earnings-growth">↑ 18.6% this year</div>
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
                <p className="earnings-panel-subtitle">Monthly earnings overview for 2024</p>
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
                <span className="earnings-panel-stat-val">₹ 72,25,000</span>
                <span className="earnings-panel-stat-trend" style={{ color: "#16a34a" }}>
                  <TrendingUp size={12} /> 18.6% this year
                </span>
              </div>
              <div className="earnings-panel-stat">
                <span className="earnings-panel-stat-label">Pending</span>
                <span className="earnings-panel-stat-val" style={{ color: "#d97706" }}>₹ 6,40,000</span>
                <span className="earnings-panel-stat-trend" style={{ color: "#64748b" }}>Awaiting payment</span>
              </div>
              <div className="earnings-panel-stat">
                <span className="earnings-panel-stat-label">Cancelled</span>
                <span className="earnings-panel-stat-val" style={{ color: "#dc2626" }}>₹ 1,75,000</span>
                <span className="earnings-panel-stat-trend" style={{ color: "#64748b" }}>
                  <TrendingDown size={12} /> Refunded
                </span>
              </div>
            </div>

            {/* Monthly Table */}
            <div className="earnings-panel-table-wrap">
              <table className="earnings-panel-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Paid</th>
                    <th>Pending</th>
                    <th>Cancelled</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_EARNINGS.map((row, i) => (
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
