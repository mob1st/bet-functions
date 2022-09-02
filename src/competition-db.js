
const { Competition, CompetitionInput } = require("./competition-entities");
const { firestore, Timestamp, DocumentReference, PUBLIC_STORAGE_URL } = require("./firebase-setup");
const { Duel, MultipleChoice } = require('./contest-entities');
const { Node } = require('./common-data')
const contenderDtoFactory = require('./contender-dto-factory');
const { ServerError, ErrorCode } = require("./server-error");
const { AvlTree } = require("@datastructures-js/binary-search-tree");

const COMPETITION_INPUT_COLLECTION = 'competitionInputs';
const COMPETITION_COLLECTION = 'competitions';
const CONTENDER_COLLECTION = 'contenders';
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
 * @param {CompetitionInput} input the input used as reference
 * @param {Competition} competition the competition to create
 */
async function create(input, competition) {
    const competitionRef = firestore.collection(COMPETITION_COLLECTION).doc();
    await createCompetition(input, competitionRef, competition);
    const contendersTree = await createContenders(input.type, competitionRef, competition);
    await createConfrontations(input.type, competitionRef, competition, contendersTree);
}

/**
 * @param {CompetitionInput} input
 * @param {DocumentReference} competitionRef 
 * @param {Competition} competition
 */
function createCompetition(
    input,
    competitionRef,
    competition,
) {
    return competitionRef.set({
        name: competition.name,
        code: competition.code,
        logo: competition.log,
        startAt: Timestamp.fromDate(competition.startAt),
        endAt: Timestamp.fromDate(competition.endAt),
        currentRound: competition.currentRound,
        rounds: competition.rounds,
        url: `${PUBLIC_STORAGE_URL}/competition/${competition.fileName}`,
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
 * @param {AvlTree<Object>}
 */
async function createContenders(inputType, competitionRef, competition) {
    const batch = firestore.batch();
    const builder = contestFactory.createDb(inputType);
    const contenders = new AvlTree((a, b) => a.apiId - b.apiId);
    competition.contenders.forEach((contender) => {
        const doc = competitionRef.collection(CONTENDER_COLLECTION).doc();
        const contenderDto = contenderDtoFactory.createDto(contender);
        batch.set(doc, contenderDto);
        contenders.insert({ ...contenderDto, ref: doc });
    });
    await batch.commit();
    return contenders;
}

/**
 * @param {DocumentReference} competitionRef 
 * @param {Competition} competition 
 * @param {AvlTree} contendersTree
 */
function createConfrontations(competitionRef, competition, contendersTree) {
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
            contest: createContestDto(contendersTree, confrontation.contest),
        });
    });
    return Promise.all(batches.map(batch => batch.commit()));
}

/**
 * 
 * @param {String} inputType 
 * @param {AvlTree} contendersTree
 * @param {Node} contest 
 * @returns {Node}
 */
function createContestDto(contendersTree, contest) {
    const current = contest.current;
    switch (true) {
        case current instanceof Duel:
            return {
                current: createDuelDto(contendersTree, contest.current),
                paths: contest.paths.map((node) => createContestDto(node))
            };
        case current instanceof MultipleChoice:
            return {
                current: contest.current,
                paths: contest.paths.map((node) => createContestDto(node))
            };
        default:
            throw ServerError(ErrorCode.INVALID_CONTEST_TYPE, `can't persist the contest type ${typeof current}`);
    }
}

/**
 * @param {AvlTree} contendersTree
 * @param {Object} contest 
 * @returns {Duel} a duel replacing the non-necessary info from contenders 
 */
function createDuelDto(contendersTree, contest) {
    const contender1 = contendersTree.find(contest.contender1).getValue();
    const contender2 = contendersTree.find(contest.contender2).getValue();
    return {
        contender1: contender1,
        contender2: contender2,
        draw: contest.draw
    }
}

module.exports = {
    create,
    getInput
}