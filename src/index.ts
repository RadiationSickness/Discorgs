import * as dotenv from 'dotenv';
import { Discorg } from './discorg'

dotenv.config({ path: './.env' });

const app: Discorg = new Discorg();

app.start();
