import { createServer } from 'node:http';
import { readData, writeData } from './controller.js';
import { v4 as uuidv4 } from 'uuid';
import URL from 'node:url';

const PORT = 5060 || 3333

const server = createServer((req, res) => {
  const { method, url } = req;

  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT")
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

      let body = "";

      req.on('data', (chunk) => { body += chunk })
      req.on('end', () => {
        const newAccount = JSON.parse(body)

        if (newAccount.hasOwnProperty('nome_usuario') && newAccount.hasOwnProperty('email') && newAccount.hasOwnProperty('senha')) {
          const isEmailRepeated = data.some(user => user.email === newAccount.email);

          if (isEmailRepeated) {
            return writeResponse(400, { 
              mensagem: "Dados inválidos: o email já existe na nossa base de dados." 
            }, 'Error: Credentials matched with another existing account.');
          }

          newAccount.id = uuidv4()
          data.push(newAccount);

          writeData(data, (err) => {
            if (err) {
              return writeResponse(500, { 
                mensagem: "Erro ao ler os dados. Por favor, tente novamente." 
              }, 'An error ocurred while reading server data.');
            }
  
            writeResponse(200, newAccount)
          })
        } else {
          return writeResponse(400, { 
            mensagem: "Dados insuficientes. Por favor, não esqueça de digitar seu nome, senha e email." 
          }, 'Not enough data was presented.');
        }
      })

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