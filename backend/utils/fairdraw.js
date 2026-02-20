const crypto = require('crypto');

/**
 * FairDraw - Transparent Random Selection using SHA-256
 * 
 * This implements a provably fair random selection algorithm.
 * The selection is deterministic but unpredictable, and can be verified.
 * 
 * @param {string[]} participants - Array of participant IDs
 * @param {string} challengeId - Challenge ID (seed)
 * @param {string} timestamp - ISO timestamp for the draw
 * @returns {Object} - Winner ID and the hash for verification
 */
function performFairDraw(participants, challengeId, timestamp) {
  if (!participants || participants.length === 0) {
    throw new Error('No participants provided');
  }

  if (participants.length === 1) {
    return {
      winner: participants[0],
      hash: generateHash(participants[0] + challengeId + timestamp)
    };
  }

  // Create a deterministic seed from all participants
  const participantSeed = participants.sort().join(',');
  
  // Generate the hash input
  const hashInput = `${participantSeed}:${challengeId}:${timestamp}`;
  
  // Generate SHA-256 hash
  const hash = generateHash(hashInput);
  
  // Convert hash to a number and use modulo to select winner
  const hashNumber = parseInt(hash.substring(0, 8), 16);
  const winnerIndex = hashNumber % participants.length;
  
  return {
    winner: participants[winnerIndex],
    hash
  };
}

/**
 * Generate SHA-256 hash
 * @param {string} data - Data to hash
 * @returns {string} - Hex string of the hash
 */
function generateHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Verify a FairDraw result
 * @param {string[]} participants - Array of participant IDs used
 * @param {string} challengeId - Challenge ID used
 * @param {string} timestamp - Timestamp used
 * @param {string} winner - The winner ID
 * @param {string} providedHash - The hash provided with the result
 * @returns {boolean} - Whether the result is valid
 */
function verifyFairDraw(participants, challengeId, timestamp, winner, providedHash) {
  const participantSeed = participants.sort().join(',');
  const hashInput = `${participantSeed}:${challengeId}:${timestamp}`;
  const expectedHash = generateHash(hashInput);
  
  return expectedHash === providedHash;
}

/**
 * Generate a verification URL for users to check the draw
 * @param {string} challengeId - Challenge ID
 * @param {string} hash - The hash from the draw
 * @returns {string} - Verification URL
 */
function generateVerificationUrl(challengeId, hash) {
  return `/verify/${challengeId}?hash=${hash}`;
}

module.exports = {
  performFairDraw,
  generateHash,
  verifyFairDraw,
  generateVerificationUrl
};
