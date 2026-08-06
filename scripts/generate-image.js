require('dotenv').config();

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { Apiframe } = require('@apiframe-ai/sdk');

const IMAGES_DIR = path.join(__dirname, '..', 'images');

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

function findImageUrls(value, found = []) {
  if (typeof value === 'string') {
    if (/^https?:\/\/\S+\.(png|jpe?g|webp)(\?\S*)?$/i.test(value)) {
      found.push(value);
    }
  } else if (Array.isArray(value)) {
    value.forEach((item) => findImageUrls(item, found));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => findImageUrls(item, found));
  }
  return found;
}

async function downloadImage(url, destPath) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, response.data);
}

function parseArgs(argv) {
  const jobIdFlagIndex = argv.findIndex((arg) => arg === '--job-id');
  if (jobIdFlagIndex !== -1) {
    return { jobId: argv[jobIdFlagIndex + 1] };
  }
  const [prompt, aspectRatio = '1:1'] = argv;
  return { prompt, aspectRatio };
}

async function main() {
  const { prompt, aspectRatio, jobId } = parseArgs(process.argv.slice(2));

  if (!prompt && !jobId) {
    console.error('Usage: node scripts/generate-image.js "<prompt>" [aspectRatio]');
    console.error('   or: node scripts/generate-image.js --job-id <jobId>');
    process.exit(1);
  }

  const apiKey = process.env.MIDJOURNEY_API_KEY;
  if (!apiKey) {
    console.error('Missing MIDJOURNEY_API_KEY. Copy .env.example to .env and set your apiframe.ai key.');
    process.exit(1);
  }

  const client = new Apiframe({ apiKey });

  let resolvedJobId = jobId;
  let namePart = jobId;

  if (!resolvedJobId) {
    console.log(`Submitting prompt: "${prompt}" (aspect ratio: ${aspectRatio})`);
    const job = await client.images.generate({
      model: 'midjourney',
      prompt,
      midjourneyParams: { aspect_ratio: aspectRatio },
    });
    resolvedJobId = job.jobId;
    namePart = slugify(prompt);
    console.log(`Job submitted (jobId: ${resolvedJobId}). Waiting for result...`);
  } else {
    console.log(`Waiting for existing job ${resolvedJobId}...`);
  }

  const job = await client.jobs.waitFor(resolvedJobId, {
    onProgress: (j) => console.log(`${j.status} ${j.progress ?? ''}`.trim()),
  });

  if (job.status === 'FAILED') {
    throw new Error(`Job failed: ${job.error || JSON.stringify(job)}`);
  }

  console.log('Job result:', JSON.stringify(job.result, null, 2));

  const imageUrls = findImageUrls(job.result);
  if (imageUrls.length === 0) {
    throw new Error(`Could not find an image URL in result: ${JSON.stringify(job.result)}`);
  }

  const savedPaths = [];
  for (let i = 0; i < imageUrls.length; i += 1) {
    const suffix = imageUrls.length > 1 ? `-${i + 1}` : '';
    const filename = `${Date.now()}-${namePart}${suffix}.png`;
    const destPath = path.join(IMAGES_DIR, filename);
    console.log(`Downloading image to ${destPath}`);
    await downloadImage(imageUrls[i], destPath);
    savedPaths.push(destPath);
  }

  console.log(`Done: ${savedPaths.join(', ')}`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
