import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

const serviceAccountPath = join(process.cwd(), 'config', 'firebase-key.json');
try {
  const content = readFileSync(serviceAccountPath, 'utf8');
  const serviceAccount = JSON.parse(content);
  console.log('Project ID:', serviceAccount.project_id);
  console.log('Client Email:', serviceAccount.client_email);
  console.log('Private Key Start:', serviceAccount.private_key.substring(0, 50));
  
  // Try to initialize and generate a token
  admin.initializeApp({
    credential: admin.credential.cert({
      ...serviceAccount,
      private_key: serviceAccount.private_key.replace(/\\n/g, '\n')
    })
  });
  console.log('Firebase Init Success');
  
  // Try to get an access token
  const token = await admin.credential.cert(serviceAccount).getAccessToken();
  console.log('Token Fetch Success');
} catch (error) {
  console.error('Check Failed:', error.message);
  if (error.stack) console.error(error.stack);
}
