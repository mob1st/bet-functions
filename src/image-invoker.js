/**
 * invokes the service responsible to download a bunch of images and 
 * upload it
 * @param {Object} batch the files to be downloaded
 * @param {Number} scheduleTime when the downloads should start
 */
async function invoke(batch, scheduleTime) {
    const { CloudTasksClient } = require("@google-cloud/tasks");
    const client = new CloudTasksClient();
    
    const parent = client.queuePath(
        process.env.GOOGLE_PROJECT_ID,
        process.env.GOOGLE_FUNCTION_LOCATION, 
        'upload-image-queue',
    );
    const task = {
        httpRequest: {
            httpMethod: 'POST',
            url: process.env.IMAGE_FUNCTION_URL,
            body: batch,
            oidcToken: {
                serviceAccountEmail: process.env.IMAGE_INVOKER_SERVICE_ACCOUNT
            }
        },
        scheduleTime: scheduleTime,
    };
    console.log('image-invoker.invoke: creating task', task);
    const request = { parent: parent, task: task };
    const [response] = await client.createTask(request);
    console.log('image-invoker.invoke: task created', response.name);
}

module.exports = {
    invoke
}