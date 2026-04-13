import { db } from '../firebase/config.js';
import { collection, getDocs } from 'firebase/firestore';

async function check() {
  try {
    const snapshot = await getDocs(collection(db, 'subjects'));
    console.log('Total subjects:', snapshot.size);
  } catch (e) {
    console.error('Error:', e);
  }
  process.exit(0);
}
check();
