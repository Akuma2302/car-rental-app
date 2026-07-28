function TimeSlotGrid({ slots, selected, onSelect }) {
  if (!slots || slots.length === 0) {
    return <p className="no-slots">No more slots today — try another date.</p>;
  }

  return (
    <div className="slot-grid">
      {slots.map((slot) => (
        <button
          key={slot.time}
          type="button"
          className={`slot${selected === slot.time ? ' selected' : ''}`}
          disabled={!slot.available}
          onClick={() => onSelect(slot.time)}
        >
          {slot.time}
        </button>
      ))}
    </div>
  );
}

export default TimeSlotGrid;
