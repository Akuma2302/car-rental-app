function SectionHeading({ eyebrow, title, description, center }) {
  return (
    <div className={`section-head${center ? ' section-head-center' : ''}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

export default SectionHeading;
