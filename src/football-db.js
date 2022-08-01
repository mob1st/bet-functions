const { firestore, Timestamp } = require("./firebase-setup");
const FOOTBALL = 'football-league';
const TEAM_COLLECTION = 'team';

/**
 * Persists the given league data into the football collection using `firestore` for that
 * @param {any} leagueData 
 */
async function set(leagueData) {		
	const leagueDocRef = firestore
		.collection(FOOTBALL)
		.doc(leagueData.id);
	await _populateLeague(leagueDocRef, leagueData);	
	await Promise.all(_populateTeams(leagueDocRef, leadData.teams));
	return leagueData;
}

function _populateLeague(leagueDocRef, leagueData) {	
	return leagueDocRef.set({
		apiId: leagueData.apiId,
		localizedName: leagueData.name,
		start: Timestamp.fromDate(leagueData.start),
		end: Timestamp.fromDate(leagueData.end)
	});
}

async function _populateTeams(leagueRef, teams) {	
	return teams.map(function (team) {
		const batch = firestore.batch();
		const teamRef = leagueRef.collection(TEAM_COLLECTION).doc(team.id);
		batch.set(teamRef, {
			apiId: team.apiId,
			name: team.name,
		}, { merge: true });
		return batch.commit();
	});	
}

module.exports = {
	set,
}