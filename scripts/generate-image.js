require('dotenv').config();

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const MidjourneyAPI = require('midjourney-api');

const IMAGES_DIR = path.join(__dirname, '..', 'images');
const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

function findImageUrl(result) {
  return (
    result.imageURL ||
    result.imageUrl ||
    result.originalImageURL ||
    result.url ||
    (Array.isArray(result.imageURLs) && result.imageURLs[0]) ||
    (Array.isArray(result.images) && result.images[0]) ||
    null
  );
}

async function pollForResult(midjourney, taskId) {
  const start = Date.now();
  while (Date.now() - start < POLL_TIMEOUT_MS) {
    const result = await midjourney.getResult(taskId);
    const status = (result.status || '').toLowerCase();

    if (status === 'finished' || status === 'done' || status === 'completed' || findImageUrl(result)) {
      return result;
    }
    if (status === 'failed' || status === 'error') {
      throw new Error(`Job failed: ${JSON.stringify(result)}`);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new Error(`Timed out waiting for task ${taskId} to finish`);
}

async function downloadImage(url, destPath) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, response.data);
}

function parseArgs(argv) {
  const taskIdFlagIndex = argv.findIndex((arg) => arg === '--task-id');
  if (taskIdFlagIndex !== -1) {
    return { taskId: argv[taskIdFlagIndex + 1] };
  }
  const [prompt, mode = 'fast'] = argv;
  return { prompt, mode };
}

async function main() {
  const { prompt, mode, taskId } = parseArgs(process.argv.slice(2));

  if (!prompt && !taskId) {
    console.error('Usage: node scripts/generate-image.js "<prompt>" [mode]');
    console.error('   or: node scripts/generate-image.js --task-id <taskId>');
    process.exit(1);
  }

  const apiKey = process.env.MIDJOURNEY_API_KEY;
  if (!apiKey) {
    console.error('Missing MIDJOURNEY_API_KEY. Copy .env.example to .env and set your apiframe.pro key.');
    process.exit(1);
  }

  const midjourney = new MidjourneyAPI(apiKey, true);

  let resolvedTaskId = taskId;
  let namePart = taskId;

  if (!resolvedTaskId) {
    console.log(`Submitting prompt: "${prompt}" (mode: ${mode})`);
    const job = await midjourney.imagine(prompt, mode);
    if (!job.taskId) {
      throw new Error(`No taskId in response: ${JSON.stringify(job)}`);
    }
    resolvedTaskId = job.taskId;
    namePart = slugify(prompt);
  }

  console.log(`Polling for result of task ${resolvedTaskId}...`);
  const result = await pollForResult(midjourney, resolvedTaskId);

  const imageUrl = findImageUrl(result);
  if (!imageUrl) {
    throw new Error(`Could not find an image URL in result: ${JSON.stringify(result)}`);
  }

  const filename = `${Date.now()}-${namePart}.png`;
  const destPath = path.join(IMAGES_DIR, filename);

  console.log(`Downloading image to ${destPath}`);
  await downloadImage(imageUrl, destPath);

  console.log(`Done: ${destPath}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
