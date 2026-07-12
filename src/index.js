import { config } from './config/index.js';
import { createAppContainer } from './container.js';
import { createApp } from './api/app.js';

const container = await createAppContainer();
const app = createApp(container);

app.listen(config.port, () => {
  container.logger.info('Data Integration & Metrics Platform listening', { port: config.port });
});