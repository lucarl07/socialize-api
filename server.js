// Internal Modules:
import fs from 'node:fs';
import { createServer } from 'node:http';
import { readData, writeData } from './controller.js';

// External Modules:
import * as formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';

// Server on PORT:
const PORT = 3333

const server = createServer((req, res) => {
  const { method, url } = req;

  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  const writeJSONResponse = (status, resEnd = "", message = "Task finished successfully!") => {
    res.writeHead(status, { "Content-Type": "application/json" })
    res.end(JSON.stringify(resEnd))
    return console.log(message + '\n');
  }

  const writeHTMLResponse = (status, resWrite = "", message = "Page accessed; please enter the requested data.") => {
    res.writeHead(status, { "Content-Type": "text/html" })
    res.end(resWrite);
    return console.log(message + '\n');
  }

  readData((error, data) => {
    if (error) {
      return writeJSONResponse(500, { 
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
            return writeJSONResponse(400, { 
              mensagem: "Dados inválidos: o e-mail já existe na nossa base de dados." 
            }, 'Error: Credentials matched with another existing account.');
          }

          newAccount.id = uuidv4()
          data.push(newAccount);

          writeData(data, (err) => {
            if (err) {
              return writeJSONResponse(500, { 
                mensagem: "Erro ao ler os dados. Por favor, tente novamente." 
              }, 'An error ocurred while reading server data.');
            }
  
            writeJSONResponse(201, newAccount)
          })
        } else {
          return writeJSONResponse(400, { 
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
            return writeJSONResponse(404, { 
              mensagem: "Usuário não encontrado. Certifique-se que você digitou o nome e senha corretos." 
            }, 'Login failed: user not found.');
          } else {
            return writeJSONResponse(200, {
              mensagem: `Bem-vindo de volta, ${userAccount.nome_usuario}!`,
              perfil: userAccount
            });
          }
        } else {
          writeJSONResponse(400, { 
            mensagem: "Por favor, preencha todos os dados antes de realizar o login." 
          }, 'Request error: lacking necessary data');
        }
      });

    } else if (method === 'POST' && url === '/perfil/imagem/envio') {
      console.log(`${method} ${url}`)

      const form = new formidable.IncomingForm();

      form.parse(req, (error, field, files) => {
        if (error) {
          return writeJSONResponse(500, {
            mensagem: "Erro ao lidar com a requisição de upload."
          }, `Error at form.parse: ${err} \nThe upload request could not be handled.`)
        }

        if (!files || !files.filetoupload[0].filepath) {
          return writeJSONResponse(400, {
            mensagem: "Nenhum arquivo foi adicionado. Por favor, adicione-o na página anterior."
          }, `Bad request: no file was received.`)
        }

        const oldUrl = files.filetoupload[0].filepath;
        const newUrl = __dirname + files.filetoupload[0].originalFilename;
        
        fs.rename(oldUrl, newUrl, (err) => {
          if (err) {
            return writeJSONResponse(500, {
              mensagem: "Erro ao escrever os dados."
            }, 'An error ocurred while writing new data.')
          }
          
          writeJSONResponse(200, { mensagem: "Arquivo adicionado com sucesso!" })
        })
      })

      writeJSONResponse(200, {
        mensagem: "Dados retornados com sucesso!"
      });
    } else if (method === 'GET' && url.startsWith('/perfil/imagem/')) {
      console.log(`${method} ${url}`)

      const id = url.split('/')[3]
      console.log(`ID: ${id}`)

      const user = data.find(account => account.id === id)

      if (!user) {
        return writeJSONResponse(404, { 
          mensagem: "Usuário não encontrado. Certifique-se que você digitou o ID correto." 
        }, 'User not found.');
      }

      writeHTMLResponse(200, `<meta charset="UTF-8"/>
        <header>
          <h1>Adicionar foto de perfil</h1>
          <p><strong>ID do usuário</strong>: ${user.id}</p>
          <p>Abaixo, adicione uma foto para o seu perfil e clique em "Enviar" para salvá-la.</p>
        </header>
        <form action="envio" method="post" enctype="multipart/form-data">
          <input type="file" name="filetoupload"> <br/><br/>
          <input type="submit" value="Enviar">
        </form>
      `);

    } else if (method === 'GET' && url.startsWith('/perfil/')) {
      console.log(`${method} ${url}`)

      const id = url.split('/')[2]
      console.log(`ID: ${id}`)

      const user = data.find(account => account.id === id)
      
      if (!user) {
        writeJSONResponse(404, { 
          mensagem: "Usuário não encontrado. Certifique-se que você digitou o ID correto." 
        }, 'User not found.');
      } else {
        writeJSONResponse(200, {
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
          return writeJSONResponse(400, {
            message: "O corpo da solicitação está vazio. Por favor, preencha-o com dados."
          }, 'Bad Request: empty body returned.');
        }

        const index = data.findIndex(user => user.id === id)

        if (index === -1) {
          return writeJSONResponse(404, { 
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
            return writeJSONResponse(500, { 
              mensagem: "Erro ao ler os dados. Por favor, tente novamente." 
            }, 'An error ocurred while reading server data.');
          }

          writeJSONResponse(201, data[index])
        })
      });

    } else if (method === 'GET' && url === '/usuarios') {
      console.log(`${method} ${url}`)
      writeJSONResponse(200, data);
    } else {
      writeJSONResponse(404, {
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