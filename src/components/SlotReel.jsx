import { useEffect, useRef } from 'react';

const SlotReel = ({ title, logos, winner, spinning, duration }) => {
  const stripRef = useRef(null);
  
  // Build the strip with repeated logos
  const longList = [...logos, ...logos, ...logos];
  
  useEffect(() => {
    if (!spinning && winner && stripRef.current) {
      // Find the winner index and center it
      const items = stripRef.current.children;
      const itemHeight = 100; // Height of each item
      
      // Find winner in the middle section
      const winnerIndex = logos.length + logos.findIndex(l => l.id === winner.id);
      const offset = (winnerIndex - 1) * itemHeight;
      
      stripRef.current.style.transform = `translateY(-${offset}px)`;
      
      // Highlight winner
      Array.from(items).forEach((item, index) => {
        if (index === winnerIndex) {
          item.classList.add('winner-highlight');
        } else {
          item.classList.remove('winner-highlight');
        }
      });
    }
  }, [spinning, winner, logos]);
  
  return (
    <div className="reel-column">
      <h3 className="reel-title">{title}</h3>
      <div className="reel-window">
        <div
          ref={stripRef}
          className={`reel-strip ${spinning ? 'spinning' : ''}`}
          style={spinning ? { '--duration': `${duration}ms` } : {}}
        >
          {longList.map((logo, index) => (
            <div key={`${logo.id}-${index}`} className="reel-item">
              <img src={logo.src} alt={logo.name} />
            </div>
          ))}
        </div>
      </div>
      {winner && !spinning && (
        <div className="win-line">
          {winner.name} voitti {title.toLowerCase()}n kilpailutuksen
        </div>
      )}
    </div>
  );
};

export default SlotReel;