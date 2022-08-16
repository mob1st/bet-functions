const QUEUE_NAME = 'my-queue';
const IMAGE_INVOKER_SERVICE_ACCOUNT= `image-upload-invoker@${process.env.GOOGLE_PROJECT_ID}.iam.gserviceaccount.com`;
const TASK_NAME = `projects/${process.env.GOOGLE_PROJECT_ID}/locations/${process.env.GOOGLE_FUNCTION_LOCATION}/queues/${QUEUE_NAME}/tasks/bilu-bilu3`;
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
        QUEUE_NAME,
    );
    const payload = JSON.stringify(batch);
    const task = {
        name: TASK_NAME,
        httpRequest: {
            httpMethod: 'POST',
            url: process.env.IMAGE_FUNCTION_URL,
            body: Buffer.from(payload).toString("base64"),
            oidcToken: {
                serviceAccountEmail: IMAGE_INVOKER_SERVICE_ACCOUNT
            }
        },
        scheduleTime: {
            seconds: scheduleTime
        },
    };
    console.log('image-invoker.invoke: creating task', task);
    const request = { parent: parent, task: task };
    const [response] = await client.createTask(request);
    console.log('image-invoker.invoke: task created', response.name);
}

module.exports = {
    invoke
}