const QUEUE_NAME = 'image-upload';
const GOOGLE_PROJECT_ID = process.env.GOOGLE_PROJECT_ID;
const IMAGE_INVOKER_SERVICE_ACCOUNT= `image-upload-invoker@${GOOGLE_PROJECT_ID}.iam.gserviceaccount.com`;

/**
 * A wrapper on top of Google Cloud Tasks to schedule the download and upload of images.
 * 
 * It receives a league data and convert it into a batch of images addresses (download and upload) to be used as part
 * of the payload that will be sent to Google Cloud tasks to persist it on disk.
 * @param {Object} league the league used to download the files
 */
async function schedule(league) {
    // init Google Tasks
    const { CloudTasksClient } = require("@google-cloud/tasks");
    const client = new CloudTasksClient();

    // build request object
    const parent = client.queuePath(
        process.env.GOOGLE_PROJECT_ID,
        process.env.GOOGLE_FUNCTION_LOCATION,
        QUEUE_NAME,
    );        
    const task = _task(league);
    const request = { parent: parent, task: task };
    console.log('football-image-task.schedule: creating task', request);

    // enqueue Google Task
    const [response] = await client.createTask(request);
    console.log('football-image-task.schedule: task created', response.name);
}

/**
 * Uses the given league to create the Google Task body request
 * @param {Object} league the given league
 * @returns the Task structure used by Google Tasks
 */
function _task(league) {
    const payload = {
        id: league.id,        
        batch: _teamImageDownloadBatch(league)
    };
    const task = {        
        httpRequest: {
            headers: { 'Content-Type': 'application/json' },
            httpMethod: 'POST',
            url: process.env.IMAGE_FUNCTION_URL,
            body: Buffer.from(JSON.stringify(payload)).toString("base64"),
            oidcToken: {
                serviceAccountEmail: IMAGE_INVOKER_SERVICE_ACCOUNT
            },
        },
        scheduleTime: {
            seconds: _scheduleTime()
        }
    };
    return task;
}

/**
 * Defines the schedule time for the Google Task
 * @returns the Timestamp corresponding to 5 minutes in the future
 */
function _scheduleTime() {
    const now = Date.now();
    const future = new Date(now + (5 * 60_000));
    return Math.floor(future / 1000);
}

/**
 * Converts the league data into batch of images to download and file names to be created
 * @param {Object} league 
 * @returns the list of downloadables
 */
function _teamImageDownloadBatch(league) {
    return league.teams.map((team) => { 
        return { 
            url: team.apiImageUrl,
            fileName: team.imageFileName
        };
    });    
}

module.exports = {
    schedule
}