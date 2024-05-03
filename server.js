import fs from "node:fs"
import http from "node:http"

const PORT = 3333

const server = http.createServer((request, response) => {
  const { method, url } = request

  fs.readFile("empregados.json", "utf8", (error, data) => {
    if (error) {
      response.writeHead(400, { "Content-Type": "application/json" })
      response.end("erro ao ler o JSON")
    }

    let jsonData = []
    try {
      jsonData = JSON.parse(data)
    } catch {
      console.log(jsonData)
      response.writeHead(200, { "Content-Type": "application/json" })
      response.end({ mesage: "Erro ao ler o JSON" })
    }

    if (method === "GET" && url === "/empregados") {
      response.writeHead(200, { "Content-Type": "application/json" })
      response.end(JSON.stringify(jsonData))

    } else if (method === "GET" && url === "/empregados/count") { // Quantos empregados existem
      const QuantidadeDeEmpregados = jsonData.length
      response.writeHead(200, { "Content-Type": "application/json" })
      response.end(JSON.stringify({ QuantidadeDeEmpregados }))

    } else if (method === "GET" && url.startsWith('/empregados/porCargo/')) { // Listar empregados por cargo
      const cargo = url.split("/")[3]
      const FiltroEmpregados = jsonData.filter((empregado) => empregado.cargo == cargo)

      response.writeHead(200, { "Content-Type": "application/json" })
      response.end(JSON.stringify({ cargo: cargo, FiltroEmpregados }))

    } else if (method === "GET" && url.startsWith('/empregados/porHabilidade/')) { // Listar empregados por habilidade
      const habilidade = url.split("/")[3]
      const FiltroEmpregados = jsonData.filter((empregado) => empregado.habilidades.find((hax) => hax == habilidade) == habilidade)

      response.writeHead(200, { "Content-Type": "application/json" })
      response.end(JSON.stringify({ habilidade: habilidade, FiltroEmpregados }))

    } else if (method === "GET" && url.startsWith('/empregados/porFaixaSalarial')) { // Listar empregados por faixa salarial
      const url = new URL(request.headers.host + request.url)
      const params = url.searchParams
      const Min = Number(params.get('min'))
      const Max = Number(params.get('max'))

      if (!isNaN(Min) || !isNaN(Max)) {
        const FiltroEmpregados = jsonData.filter((empregado) => empregado.salario >= Min && empregado.salario <= Max)

        if(FiltroEmpregados.length !== 0)
        response.writeHead(200, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ FaixaSalarial: { Min, Max }, FiltroEmpregados }))
      } else {
        response.writeHead(400, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "Erro ao ler parametros" }))
      }
    } else if (method === "GET" && url.startsWith('/empregados/')) { // Listar empregado especifico por id
      const id = url.split("/")[2]
      const index = jsonData.findIndex((empregado) => empregado.id == id)

      if (index !== -1) {
        response.writeHead(200, { "Content-Type": "application/json" })
        response.end(JSON.stringify(jsonData[index]))
      } else {
        response.writeHead(404, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "empregado não encontrado" }))
      }
    } else if (method === "POST" && url === "/empregados") { // Adicionar um empregado
      let body = ''
      request.on('data', (chunk) => {
        body += chunk
      })
      request.on('end', () => {
        const NovoEmpregado = JSON.parse(body)
        NovoEmpregado.id = jsonData.length + 1

        jsonData.push(NovoEmpregado)
        fs.writeFile("empregados.json", JSON.stringify(jsonData, null, 2), (err) => {
          if (err) {
            response.writeHead(500, { "Content-Type": "application/json" })
            response.end(
              JSON.stringify({ message: "Erro interno do servidor" })
            )
            return
          }
          response.writeHead(202, { "Content-Type": "application/json" })
          response.end(JSON.stringify(jsonData))
        })
      })
    } else if (method === "PUT" && url.startsWith('/empregados/')) {  // Atualizar os dados de um empregado
      const id = url.split("/")[2]
      const index = jsonData.findIndex((empregado) => empregado.id == id)

      let body = ''
      request.on('data', (chunk) => {
        body += chunk
      })
      request.on('end', () => {
        const infoEmpregado = JSON.parse(body)
        jsonData[index] = { ...jsonData[index], ...infoEmpregado }
        fs.writeFile("empregados.json", JSON.stringify(jsonData, null, 2), (err) => {
          if (err) {
            response.writeHead(500, { "Content-Type": "application/json" })
            response.end(
              JSON.stringify({ message: "Erro interno do servidor" })
            )
            return
          }
          response.writeHead(200, { "Content-Type": "application/json" })
          response.end(JSON.stringify(jsonData[index]))
        })
      })
    } else if (method === "DELETE" && url.startsWith('/empregados/')) { // Deletar um empregado
      const id = url.split("/")[2]
      const index = jsonData.findIndex((empregado) => empregado.id == id)
      jsonData.splice(index, 1)
      fs.writeFile("empregados.json", JSON.stringify(jsonData, null, 2), (err) => {
        if (err) {
          response.writeHead(500, { "Content-Type": "application/json" })
          response.end(
            JSON.stringify({ message: "Erro interno do servidor" })
          )
          return
        }
        response.writeHead(200, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "item Deletado" }))
      })
    } else {
      response.writeHead(400, { "Content-Type": "application/json" })
      response.end({ mesage: "Rota não encontrada" })
    }
  })
})

server.listen(PORT, () => {
  console.log(`Servidor on PORT:${PORT}🚀`)
})