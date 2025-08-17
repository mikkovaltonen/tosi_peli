const PreferenceSelector = ({ label, value, onChange, options }) => {
  return (
    <div className="preference-group">
      <label className="preference-label">{label}:</label>
      <div className="slicer-options">
        {options.map(option => (
          <button
            key={option.value}
            className={`slicer-option ${value === option.value ? 'active' : ''}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PreferenceSelector;