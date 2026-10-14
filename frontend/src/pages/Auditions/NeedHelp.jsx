import PagesButton from "../common/PagesButton";
import { Headphones } from "lucide-react";

export default function NeedHelp({ onContactSupport }) {
  const defaultAction = () => alert("Connecting with Support team...");

  return (
    <div className="ac-help-card">
      <div className="ac-help-content-row">
        <div className="ac-help-text-block">
          <h4>Need help?</h4>
          <p>Our team is here to help you succeed in your acting journey.</p>
        </div>
        <div className="ac-help-icon-wrapper">
          <Headphones size={24} />
        </div>
      </div>
      
      <PagesButton
        onClick={onContactSupport || defaultAction}
        className="ac-solid-btn"
      >
        Contact Support
      </PagesButton>
    </div>
  );
}
