import { createServer } from 'node:http';
import { readData, writeData } from './controller.js';
import URL from 'node:url';

const PORT = 5060 || 3333

const server = createServer((req, res) => {})

server.listen(PORT, () => {
  console.clear();
  console.log(`Welcome to the Socialize API! \nVersion: Alpha 0.1.0 ⚙️ \nServer on PORT: ${PORT} 🚀 \n`);
  console.log(`Create an account with POST http://localhost:${PORT}/usuarios and join the team!`);
})