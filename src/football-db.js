const { QueryDocumentSnapshot } = require("firebase-admin/firestore");
const { firestore, Timestamp, DocumentReference, PUBLIC_STORAGE_URL} = require("./firebase-setup");

const FOOTBALL_LEAGUE_COLLECTION = 'football';
const TEAM_COLLECTION = 'team';
const MATCH_COLLECTION = 'match';

/**
 * Persists the given league data mapping the properties to something that can be sent to
 * a football on `firestore`.
 * @param {Object} leagueData the data to be persisted
 */
async function set(leagueData) {
	console.log('football-db.set: persisting league data', JSON.stringify(leagueData));
	const leagueDocRef = firestore
		.collection(FOOTBALL_LEAGUE_COLLECTION)
		.doc(leagueData.id);
	await _populateLeague(leagueDocRef, leagueData);
	await _populateTeams(leagueDocRef, leagueData.teams);
	await _populateMatches(leagueDocRef, leagueData.matches)
	return leagueData;
}

/**
 * Defines the collection address of teams playing a specific league
 * @param {String} leagueId the id of the given list
 * @returns a string containing the collection address of teams
 */
function teamCollection(leagueId) {
	return `${FOOTBALL_LEAGUE_COLLECTION}/${leagueId}/${TEAM_COLLECTION}`;
}

/**
 * Persist the given league data into league collection on firestore
 * @param {DocumentReference} leagueDocRef collection used for persistence
 * @param {Object} leagueData data to be persisted
 * @returns {Promise} result of set
 */
function _populateLeague(leagueDocRef, leagueData) {
	console.log('football-db._populateLeague: persisting league data', JSON.stringify(leagueData));
	return leagueDocRef.set({
		apiId: leagueData.apiId,
		name: leagueData.name.toJSON(),
		start: Timestamp.fromDate(leagueData.start),
		end: Timestamp.fromDate(leagueData.end),
	});
}

/**
 * Persist in batch the given list of teams into the league/team collection on firestore
 * @param {DocumentReference} leagueRef collection used for persistence
 * @param {Array<Object>} teams data to be persisted
 * @returns {Promise} result of set
 */
function _populateTeams(leagueRef, teams) {
	console.log('footbal-db._populateTeams', JSON.stringify(teams));
	const batch = firestore.batch();
	teams.map(function (team) {
		console.log('footbal-db._populateTeams.$map', JSON.stringify(team));
		const teamRef = leagueRef.collection(TEAM_COLLECTION).doc(team.id);
		batch.set(teamRef, {
			apiId: team.apiId,
			name: team.name.toJSON(),
			national: team.national,
			imageUrl: `${PUBLIC_STORAGE_URL}/${team.imageFileName}`,
		});
	});	
	console.log('footbal-db._populateTeams: batch.commit');
	return batch.commit();
}

/**
 * Persist in batch the given list of matches into the league/match collection on firestore
 * @param {DocumentReference} leagueRef collection used for persistence
 * @param {Array<Object>} matches data to be persisted
 * @returns {Promise} result of set
 */
async function _populateMatches(leagueRef, teams, matches) {
	console.log('footbal-db._populateMatches', JSON.stringify(matches));		
	const batch = firestore.batch();
	matches.forEach(function (match) {	
		const home = match.home;
		const away = match.away;
		const matchReaf = leagueRef.collection(MATCH_COLLECTION).doc(match.id);
		batch.set(matchReaf, {			
			apiId: match.apiId,
			date: Timestamp.fromDate(match.date),
			status: 'NS',
			allowDraw: true,
			contendores: [
				{
					home: true,
					name: home.name.toJSON(),
					imageUrl: _teamImageUrl(home),
					ref: leagueRef.collection(TEAM_COLLECTION).doc(home.id)
				},
				{
					home: false,
					away: away.name.toJSON(),
					imageUrl: _teamImageUrl(away),
					ref: leagueRef.collection(TEAM_COLLECTION).doc(away.id)
				},				
			],
			group: {
				name: match.group.name
			},
			round: {
				name: match.round.toJSON(),
				ref: leagueRef.collection().doc(match.round.id)
			}
		});
	});
	console.log('footbal-db._populateMatches: batch.commit');
	return batch.commit();
}

function _teamImageUrl(team) {
	return `${PUBLIC_STORAGE_URL}/${team.imageFileName}`;
}

module.exports = {
	set,
	teamCollection
}