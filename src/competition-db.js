
const { Competition, CompetitionType } = require("./competition-entities");
const { firestore, Timestamp, DocumentReference, PUBLIC_STORAGE_URL } = require("./firebase-setup");

const COMPETITION_COLLECTION = 'competitions';
const CONFRONTATION_COLLECTION = 'team';
const MATCH_COLLECTION = 'match';

/**
 * 
 * @param {Competition} competition 
 */
function put(competition) {
    
}