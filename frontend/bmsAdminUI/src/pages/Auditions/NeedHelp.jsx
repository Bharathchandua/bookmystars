import PagesButton from "../common/PagesButton";
import { Headphones } from "lucide-react";
import { showSuccess } from "../../shared/utils/alert";

export default function NeedHelp({ onContactSupport }) {
  const defaultAction = () => showSuccess("Support Requested", "Our talent support team will connect with you shortly.");

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
