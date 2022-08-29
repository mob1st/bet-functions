
const { Competition, CompetitionInput } = require("./competition-entities");
const { firestore, Timestamp, DocumentReference, PUBLIC_STORAGE_URL } = require("./firebase-setup");

const COMPETITION_INPUT_COLLECTION = 'competitionInputs';
const COMPETITION_COLLECTION = 'competitions';
const CONFRONTATION_COLLECTION = 'confrontations';
const BATCH_WRITE_LIMIT = 500;

/**
 * Get the competition input related to the given parameters
 * @param {String} type the type of competition. eg: FOOTBALL 
 * @param {String} code the code that identifies the competition. eg: world_cup
 * @param {Number} season the season of the competition
 * @returns {CompetitionInput}
 */
async function getInput(type, code, season) {
    console.info('fetching competition input %s %s %d', type, code, season);
    const query = firestore.collection(COMPETITION_INPUT_COLLECTION)
        .where("type", "==", type)
        .where("code", "==", code)
        .where("season", "==", season);
    const querySnaptshot = await query.get();
    console.debug('size of requires %d', querySnaptshot.docs.length);
    const doc = querySnaptshot.docs[0];
    const data = doc.data();
    console.debug('result: %s', JSON.stringify(data));
    return { ...data, id: doc.id };
}

/**
 * Creates a competition related to the given input
 * @param {CompetitionInput} the input used as reference
 * @param {Competition} competition the competition to create
 */
async function create(input, competition) {
    const competitionRef = firestore.collection(COMPETITION_COLLECTION).doc();
    await createCompetition(competitionRef, input, competition)
    await createConfrontations(competitionRef, competition);
}

/**
 * 
 * @param {DocumentReference} competitionRef 
 * @param {CompetitionInput} input
 * @param {Competition} competition
 */
function createCompetition(
    competitionRef,
    input,
    competition,
) {
    return competitionRef.set({
        name: competition.name,
        code: competition.code,
        startAt: Timestamp.fromDate(competition.startAt),
        endAt: Timestamp.fromDate(competition.endAt),
        currentRound: competition.currentRound,
        rounds: competition.rounds,
        input: {
            type: input.type,
            ref: firestore.collection(COMPETITION_INPUT_COLLECTION).doc(input.id)
        }
    });
}

/**
 * 
 * @param {DocumentReference} competitionRef 
 * @param {Competition} competition 
 */
function createConfrontations(competitionRef, competition) {
    const batches = [];
    competition.confrontations.forEach((confrontation, index) => {
        if (index == 0 || index % BATCH_WRITE_LIMIT == 0) {
            console.log('creating batch %d', index);
            batches.push(firestore.batch());
        }
        const batch = batches.at(-1);
        const confrontationRef = competitionRef.collection(CONFRONTATION_COLLECTION).doc();
        batch.set(confrontationRef, {
            expectedDuration: confrontation.expectedDuration,
            apiId: confrontation.apiId,
            startAt: Timestamp.fromDate(confrontation.startAt),
            allowBetsUntil: Timestamp.fromDate(confrontation.allowBetsUntil),
            round: confrontation.round,
            group: confrontation.group,
            status: confrontation.status,
            contest: confrontation.contest,
        });
    });
    return Promise.all(batches.map(batch => batch.commit()));
}

module.exports = {
    create,
    getInput
}