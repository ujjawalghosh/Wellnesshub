/**
 * Fair Draw Utility
 * Used for random selection in challenges
 */

const fairDraw = (participants) => {
  if (!participants || participants.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * participants.length);
  return participants[randomIndex];
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

module.exports = {
  fairDraw,
  shuffleArray
};

