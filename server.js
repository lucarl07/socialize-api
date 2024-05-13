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
              mensagem: "Dados inválidos: o e-mail já existe na nossa base de dados." 
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
  
            writeResponse(201, newAccount)
          })
        } else {
          return writeResponse(400, { 
            mensagem: "Por favor, preencha seu nome, e-mail e senha antes de realizar o login." 
          }, 'Request error: lacking necessary data');
        }
      })

    } else if (method === 'POST' && url === '/login') {
      console.log(`${method} ${url}`)

      let body = "";

      req.on('data', (chunk) => { body += chunk })
      req.on('end', () => {
        const userData = JSON.parse(body)

        if (userData.hasOwnProperty('email') && userData.hasOwnProperty('senha')) {
          const userAccount = data.find(account =>
            account.email === userData.email &&
            account.senha === userData.senha
          );

          if (!userAccount) {
            return writeResponse(404, { 
              mensagem: "Usuário não encontrado. Certifique-se que você digitou o nome e senha corretos." 
            }, 'Login failed: user not found.');
          } else {
            return writeResponse(200, {
              mensagem: `Bem-vindo de volta, ${userAccount.nome_usuario}!`,
              perfil: userAccount
            });
          }
        } else {
          writeResponse(400, { 
            mensagem: "Por favor, preencha todos os dados antes de realizar o login." 
          }, 'Request error: lacking necessary data');
        }
      });

    } else if (method === 'GET' && url.startsWith('/perfil/')) {
      console.log(`${method} ${url}`)

      const id = url.split('/')[2]
      console.log(`ID: ${id}`)

      const user = data.find(account => account.id === id)
      
      if (!user) {
        writeResponse(404, { 
          mensagem: "Usuário não encontrado. Certifique-se que você digitou o ID correto." 
        }, 'User not found.');
      } else {
        writeResponse(200, {
          nome_usuario: user.nome_usuario,
          foto_perfil: user.foto_perfil,
          bio: user.bio
        });
      }

    } else if (method === 'PUT' && url.startsWith('/perfil/')) {
      console.log(`${method} ${url}`)

      const id = url.split('/')[2]
      console.log(`ID: ${id}`)

      let body = "";

      req.on('data', (chunk) => { body += chunk })
      req.on('end', () => {
        const updtAccount = JSON.parse(body)

        if (!updtAccount) {
          return writeResponse(400, {
            message: "O corpo da solicitação está vazio. Por favor, preencha-o com dados."
          }, 'Bad Request: empty body returned.');
        }

        const index = data.findIndex(user => user.id === id)

        if (index === -1) {
          return writeResponse(404, { 
            mensagem: "Usuário não encontrado. Certifique-se que você digitou o ID correto." 
          }, 'User not found.');
        }

        data[index] = {
          ...updtAccount,
          email: data[index].email,
          senha: data[index].senha,
          id: data[index].id
        }

        writeData(data, (err) => {
          if (err) {
            return writeResponse(500, { 
              mensagem: "Erro ao ler os dados. Por favor, tente novamente." 
            }, 'An error ocurred while reading server data.');
          }

          writeResponse(201, data[index])
        })
      });

    } else if (method === 'POST' && url.startsWith('/perfil/imagem/')) {
      console.log(`${method} ${url}`)

      const id = url.split('/')[2]
      console.log(`ID: ${id}`)

      let body = "";

      req.on('data', (chunk) => { body += chunk })
      req.on('end', () => {
        const profilePicture = JSON.parse(body)

        if (!profilePicture) {
          return writeResponse(400, {
            message: "O corpo da solicitação está vazio. Por favor, preencha-o com dados."
          }, 'Bad Request: empty body returned.');
        }

        const index = data.findIndex(user => user.id === id)

        if (index === -1) {
          return writeResponse(404, { 
            mensagem: "Usuário não encontrado. Certifique-se que você digitou o ID correto." 
          }, 'User not found.');
        }

        data[index].foto_perfil = profilePicture

        writeData(data, (err) => {
          if (err) {
            return writeResponse(500, { 
              mensagem: "Erro ao ler os dados. Por favor, tente novamente." 
            }, 'An error ocurred while reading server data.');
          }

          writeResponse(201, data[index])
        })
      });
    } else if (method === 'GET' && url === '/usuarios') {
      console.log(`${method} ${url}`)
      writeResponse(200, data);
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