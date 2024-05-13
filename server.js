import { createServer } from 'node:http';
import { readData, writeData } from './controller.js';
import URL from 'node:url';

const PORT = 5060 || 3333

const server = createServer((req, res) => {
  const { method, url } = req;

  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  const writeResponse = (status, resEnd = "", message = "Task finished successfully!") => {
    res.writeHead(status, { "Content-Type": "application/json" })
    res.end(JSON.stringify(resEnd))
    return console.log(message + '\n');
  }

  readData((error, data) => {
    if (error) {
      return writeResponse(500, { 
        mensagem: "Erro ao ler os dados. Por favor, tente novamente." 
      }, 'An error ocurred while reading server data.');
    }

    if (method === 'POST' && url === '/usuarios') {
      console.log(`${method} ${url}`)
    } else if (method === 'POST' && url === '/login') {
      console.log(`${method} ${url}`)
    } else if (method === 'GET' && url.startsWith('/perfil/')) {
      console.log(`${method} ${url}`)
    } else if (method === 'PUT' && url.startsWith('/perfil/')) {
      console.log(`${method} ${url}`)
    } else if (method === 'POST' && url === '/perfil/imagem') {
      console.log(`${method} ${url}`)
    } else if (method === 'GET' && url === '/usuarios') {
      console.log(`${method} ${url}`)
    } else {
      writeResponse(404, {
        mensagem: "Página não encontrada. Por favor, verifique a URL e o método HTTP utilizado."
      }, 'The endpoint was not found.')
    }
  });
})

server.listen(PORT, () => {
  console.clear();
  console.log(`Welcome to the Socialize API! \nVersion: Alpha 0.1.0 ⚙️ \nServer on PORT: ${PORT} 🚀 \n`);
  console.log(`Create an account with POST http://localhost:${PORT}/usuarios and join the team!`);
})