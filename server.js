import http from "node:http"
import {escreverDadosFuncionarios, lerDadosFuncionarios} from "./funcionalidades.js"

const PORT = 3333


const server = http.createServer((request, response) => {
  const { method, url } = request

  response.setHeader('Access-Control-Allow-Origin', "*")
  response.setHeader('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE")
  response.setHeader('Access-Control-Allow-Headers', "Content-Type")

  if (method === "GET" && url === "/empregados") {
    lerDadosFuncionarios((err, funcionarios) => {
      if (err) {
        response.writeHead(500, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "erro de servidor" }))
      }
      response.writeHead(200, { "Content-Type": "application/json" })
      response.end(JSON.stringify(funcionarios))
    })

  } else if (method === "GET" && url === "/empregados/count") { // Quantos empregados existem
    lerDadosFuncionarios((err, funcionarios) => {
      if (err) {
        response.writeHead(500, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "erro de servidor" }))
      }
      const QuantidadeDeEmpregados = funcionarios.length
      response.writeHead(200, { "Content-Type": "application/json" })
      response.end(JSON.stringify({ QuantidadeDeEmpregados }))
    })


  } else if (method === "GET" && url.startsWith('/empregados/porCargo/')) { // Listar empregados por cargo
    lerDadosFuncionarios((err, funcionarios) => {
      if (err) {
        response.writeHead(500, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "erro de servidor" }))
      }
      const cargo = url.split("/")[3]
      const FiltroEmpregados = funcionarios.filter((empregado) => empregado.cargo == cargo)

      response.writeHead(200, { "Content-Type": "application/json" })
      response.end(JSON.stringify({ NumeroDeEmpregados: FiltroEmpregados.length, FiltroEmpregados }))
    })


  } else if (method === "GET" && url.startsWith('/empregados/porHabilidade/')) { // Listar empregados por habilidade
    lerDadosFuncionarios((err, funcionarios) => {
      if (err) {
        response.writeHead(500, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "erro de servidor" }))
      }
      let habilidade = (url.split("/")[3])
      habilidade = habilidade[0].toUpperCase() + habilidade.substring(1)

      const FiltroEmpregados = funcionarios.filter((empregado) => empregado.habilidades.includes(habilidade))
      // const FiltroEmpregados = funcionarios.filter((empregado) => empregado.habilidades.find((hax) => hax == habilidade) == habilidade)

      response.writeHead(200, { "Content-Type": "application/json" })
      response.end(JSON.stringify({ NumeroDeEmpregados: FiltroEmpregados.length, FiltroEmpregados }))
    })



  } else if (method === "GET" && url.startsWith('/empregados/porFaixaSalarial')) { // Listar empregados por faixa salarial
    lerDadosFuncionarios((err, funcionarios) => {
      if (err) {
        response.writeHead(500, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "erro de servidor" }))
      }
      const url = new URL(request.headers.host + request.url)

      const Min = Number(url.searchParams.get('min'))
      const Max = Number(url.searchParams.get('max'))

      if (!isNaN(Min) && !isNaN(Max)) {
        const FiltroEmpregados = funcionarios.filter((empregado) => empregado.salario >= Min && empregado.salario <= Max)

        response.writeHead(200, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ NumeroDeEmpregados: FiltroEmpregados.length, FiltroEmpregados }))

      } else {
        response.writeHead(400, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "Erro ao ler parametros" }))
      }

    })

  } else if (method === "GET" && url.startsWith('/empregados/')) { // Listar empregado especifico por id
    lerDadosFuncionarios((err, funcionarios) => {
      if (err) {
        response.writeHead(500, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "erro de servidor" }))
      }
      const id = url.split("/")[2]
      const index = funcionarios.findIndex((empregado) => empregado.id == id)

      if (index !== -1) {
        response.writeHead(200, { "Content-Type": "application/json" })
        response.end(JSON.stringify(funcionarios[index]))
      } else {
        response.writeHead(404, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "empregado não encontrado" }))
      }
    })

  } else if (method === "POST" && url === "/empregados") { // Adicionar um empregado
    lerDadosFuncionarios((err, funcionarios) => {
      if (err) {
        response.writeHead(500, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "erro de servidor" }))
      }

      let body = ''
      request.on('data', (chunk) => {
        body += chunk
      })
      request.on('end', () => {
        const NovoEmpregado = JSON.parse(body)
        NovoEmpregado.id = funcionarios.length + 1

        funcionarios.push(NovoEmpregado)

        escreverDadosFuncionarios(funcionarios, (err) => {
          if (err) {
            response.writeHead(500, { "Content-Type": "application/json" })
            response.end(JSON.stringify({ message: "erro de servidor" }))
            return
          }
          response.writeHead(202, { "Content-Type": "application/json" })
          response.end(JSON.stringify(funcionarios))

        })
      })
    })

  } else if (method === "PUT" && url.startsWith('/empregados/')) {  // Atualizar os dados de um empregado
    lerDadosFuncionarios((err, funcionarios) => {
      if (err) {
        response.writeHead(500, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "erro de servidor" }))
      }

      const id = url.split("/")[2]
      const index = funcionarios.findIndex((empregado) => empregado.id == id)

      if (index !== -1) {
        let body = ''
        request.on('data', (chunk) => {
          body += chunk
        })
        request.on('end', () => {
          const infoEmpregado = JSON.parse(body)

          funcionarios[index] = { ...funcionarios[index], ...infoEmpregado }

          escreverDadosFuncionarios(funcionarios, (err) => {
            if (err) {
              response.writeHead(500, { "Content-Type": "application/json" })
              response.end(JSON.stringify({ message: "erro de servidor" }))
              return
            }
            response.writeHead(200, { "Content-Type": "application/json" })
            response.end(JSON.stringify(funcionarios[index]))

          })
        })
      } else {
        response.writeHead(404, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "funcionario não encontrado" }))
      }
    })

  } else if (method === "DELETE" && url.startsWith('/empregados/')) { // Deletar um empregado
    lerDadosFuncionarios((err, funcionarios) => {
      if (err) {
        response.writeHead(500, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "erro de servidor" }))
      }
      const id = url.split("/")[2]
      const index = funcionarios.findIndex((empregado) => empregado.id == id)

      if (index === -1) {
        response.writeHead(404, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "funcionario não encontrado" }))

      } else {
        funcionarios.splice(index, 1)

        escreverDadosFuncionarios(funcionarios, (err) => {
          if (err) {
            response.writeHead(500, { "Content-Type": "application/json" })
            response.end(JSON.stringify({ message: "erro de servidor" }))
            return
          }
          response.writeHead(200, { "Content-Type": "application/json" })
          response.end(JSON.stringify({ message: 'item Deletado' }))

        })
      }
    })

  } else {
    response.writeHead(400, { "Content-Type": "application/json" })
    response.end({ mesage: "Rota não encontrada" })
  }
})

server.listen(PORT, () => {
  console.log(`Servidor on PORT:${PORT}🚀`)
})