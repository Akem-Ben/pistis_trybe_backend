import http from 'http';
import dotenv from 'dotenv';
import createApp from './app';
import { initSocket } from './configurations/socket';
import configurations from './configurations';
import { connectToDatabase } from './configurations/database';

dotenv.config();

const app = createApp();
const server = http.createServer(app);


initSocket(server);

const PORT = configurations.PORT || 8080;

(async () => {
  try {
    await connectToDatabase();
    initSocket(server);
    server.listen(PORT, () => {
      console.log(`server running on Port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
