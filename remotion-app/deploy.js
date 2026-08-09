const { deploySite, getOrCreateBucket, deployFunction, getFunctions } = require("@remotion/lambda");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });

async function deploy() {
  console.log("Starting Remotion Lambda deployment...");
  
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error("Missing AWS Credentials in .env file!");
    process.exit(1);
  }

  const region = process.env.REMOTION_AWS_REGION || "us-east-1";

  // 1. Get or create an S3 bucket
  const { bucketName } = await getOrCreateBucket({ region });
  console.log(`Using bucket: ${bucketName}`);

  // 2. Deploy the site (this bundles our React Remotion project and uploads it to S3)
  const { serveUrl } = await deploySite({
    entryPoint: path.join(__dirname, "src", "index.ts"),
    bucketName,
    region,
    siteName: "content-maker-templates"
  });
  console.log(`Deployed site to: ${serveUrl}`);

  // 3. Deploy the Lambda function
  const { functionName } = await deployFunction({
    createCloudWatchLogGroup: true,
    memorySizeInMb: 2048,
    region,
    timeoutInSeconds: 120,
  });
  console.log(`Deployed Lambda function: ${functionName}`);

  console.log("\n✅ Deployment successful!");
  console.log(`\nAdd these to your .env file:\n`);
  console.log(`REMOTION_SERVE_URL=${serveUrl}`);
  console.log(`REMOTION_FUNCTION_NAME=${functionName}`);
}

deploy().catch(console.error);
