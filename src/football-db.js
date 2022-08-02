const { firestore, Timestamp, DocumentReference } = require("./firebase-setup");
const FOOTBALL = 'football-league';
const TEAM_COLLECTION = 'team';

/**
 * Persists the given league data mapping the properties to something that can be sent to
 * a football on `firestore`.
 * 
 * @param {Object} leagueData 
 */
async function set(leagueData) {
	console.log(`football-db.set: persisting league data: ${JSON.stringify(leagueData)}`);
	const leagueDocRef = firestore
		.collection(FOOTBALL)
		.doc(leagueData.id);
	await leagueDocRef.set({
		apiId: leagueData.apiId,
		name: leagueData.name.toJSON(),
		start: Timestamp.fromDate(leagueData.start),
		end: Timestamp.fromDate(leagueData.end),
	});	
	await _populateTeams(leagueDocRef, leagueData.teams);
	return leagueData;
}

/**
 * persist the given league data into league collection on firestore
 * @param {DocumentReference} leagueDocRef collection used for persistence
 * @param {Object} leagueData data to be persisted
 * @returns result of set
 */
function _populateLeague(leagueDocRef, leagueData) {
	console.log(`football-db._populateLeague: persisting league data: ${JSON.stringify(leagueData)}`);
	return leagueDocRef.set({
		apiId: leagueData.apiId,
		name: leagueData.name.toJSON(),
		start: Timestamp.fromDate(leagueData.start),
		end: Timestamp.fromDate(leagueData.end),
	});
}

/**
 * persist in batch the given list of teams into league/team collection on firestore
 * @param {DocumentReference} leagueRef collection used for persistence
 * @param {Array<Object>} teams data to be persisted
 * @returns result of set
 */
function _populateTeams(leagueRef, teams) {		
	console.log('footbal-api._populateTeams: ' + JSON.stringify(teams));
	const batch = firestore.batch();
	teams.map(function (team) {
		console.log('footbal-api._populateTeams.$map: ' + JSON.stringify(team));
				const teamRef = leagueRef.collection(TEAM_COLLECTION).doc(team.id);
		batch.set(teamRef, {
			apiId: team.apiId,
			name: team.name.toJSON(),
		});
	});	
	return batch.commit();
}

module.exports = {
	set,
}