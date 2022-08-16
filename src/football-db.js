const { firestore, Timestamp, DocumentReference, PUBLIC_STORAGE_URL} = require("./firebase-setup");

const FOOTBALL_LEAGUE_COLLECTION = 'football';
const TEAM_COLLECTION = 'team';

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
 * Persist in batch the given list of teams into league/team collection on firestore
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

module.exports = {
	set,
	teamCollection
}