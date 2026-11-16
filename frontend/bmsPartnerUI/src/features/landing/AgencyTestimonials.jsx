import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Button from "../../common/Button.jsx";
import Card from "../../common/Card.jsx";

export default function AgencyTestimonials() {
  const testimonials = [
    {
      quote: "BookMyStars has been a game changer for our agency. We found amazing talent, great brand partners and reached new audiences like never before!",
      author: "Riya Mehta",
      role: "Founder, Style Society",
      logoText: "STYLE SOCIETY",
      rating: "5.0",
    },
    {
      quote: "Managing artists and booking premium campaigns has never been easier. The platform connects us directly with top brands and provides end-to-end support.",
      author: "Vikram Malhotra",
      role: "Director, V-Management",
      logoText: "V-MGMT",
      rating: "4.9",
    },
    {
      quote: "We've scaled our business and increased brand collaborations by 150% in just six months. The transparency and talent quality are unmatched.",
      author: "Ananya Sen",
      role: "CEO, Spark Agency",
      logoText: "SPARK MEDIA",
      rating: "5.0",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const handlePrev = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
      setFade(true);
    }, 200);
  };

  const handleNext = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
      setFade(true);
    }, 200);
  };

  const renderQuote = (text) => {
    if (typeof text !== "string") return text;
    const word = "BookMyStars";
    if (!text.includes(word)) return text;
    const parts = text.split(word);
    return (
      <>
        {parts[0]}
        <strong>{word}</strong>
        {parts[1]}
      </>
    );
  };

  const current = testimonials[currentIndex];

  return (
    <section className="testimonial-wrapper agency-section-padding">
      <div className="testimonial-container">
        <Card className="testimonial-card-main">
          {/* Left Navigation Arrow */}
          <Button
            onClick={handlePrev}
            className="testimonial-navigation-btn testimonial-left-arrow"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={20} />
          </Button>

          {/* Testimonial Quote & Info */}
          <div
            className="testimonial-content-wrapper"
            style={{
              opacity: fade ? 1 : 0.4,
              transition: "opacity 0.2s ease-in-out",
            }}
          >
            <svg
              viewBox="0 0 512 512"
              width="60"
              height="60"
              fill="currentColor"
              className="testimonial-quote-icon"
            >
              <path d="M464 256h-80v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8c-88.4 0-160 71.6-160 160v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48zm-288 0H96v-64c0-35.3 28.7-64 64-64h8c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24h-8C71.6 32 0 103.6 0 192v240c0 26.5 21.5 48 48 48h128c26.5 0 48-21.5 48-48V304c0-26.5-21.5-48-48-48z" />
            </svg>
            <p className="testimonial-text-quote">"{renderQuote(current.quote)}"</p>
          </div>

          {/* Author details */}
          <div
            className="testimonial-author-wrapper"
            style={{
              opacity: fade ? 1 : 0.4,
              transition: "opacity 0.2s ease-in-out",
            }}
          >
            <div className="testimonial-agency-logo-box">{current.logoText}</div>
            <div className="testimonial-author-details">
              <span className="testimonial-author-name">{current.author}</span>
              <span className="testimonial-author-role">{current.role}</span>
              <div className="testimonial-rating-stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="testimonial-rating-star-icon"
                    fill="currentColor"
                  />
                ))}
                <span className="testimonial-rating-value">{current.rating}</span>
              </div>
            </div>
          </div>

          {/* Right Navigation Arrow */}
          <Button
            onClick={handleNext}
            className="testimonial-navigation-btn testimonial-right-arrow"
            aria-label="Next testimonial"
          >
            <ChevronRight size={20} />
          </Button>
        </Card>
      </div>
    </section>
  );
}
