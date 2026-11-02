import { UsersRound, BriefcaseBusiness, Crown } from "lucide-react";
import { cards } from "../data/siteData.js";
import Card from "./common/Card";

const icons = [UsersRound, BriefcaseBusiness, Crown];

export default function OpportunityCards() {
  return (
    <section className="container section-small opportunity-section">
      <div className="section-title">
        <span>— DISCOVER • CONNECT • COLLABORATE —</span>
        <h2>
          Real <b>Opportunities.</b> Real Impact.
        </h2>
      </div>

      <div className="row justify-content-center g-2">
        {cards.map(([title, txt, cta, img, , linkPath], index) => {
          const Icon = icons[index];
          const descriptionNode = index === 0 ? (
            <>
              Showcase your talent, build your profile and get
              discovered by
              <br />
              the right people.
            </>
          ) : (
            txt
          );

          return (
            <div className="col-md-4" key={title}>
              <Card
                variant="opportunity"
                title={title}
                description={descriptionNode}
                image={img}
                imageClassName={index === 1 ? "img-camera-operator" : ""}
                icon={<Icon size={32} strokeWidth={2.1} />}
                link={linkPath}
                linkText={cta}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
