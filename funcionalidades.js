import fs from 'node:fs'

const escreverDadosFuncionarios = (funcionarios, callback,) => {
  fs.writeFile("empregados.json", JSON.stringify(funcionarios, null, 2), (err) => {
    if (err) {
      callback(err)
    }
    callback(null)
  })
}

const lerDadosFuncionarios = (callback) => {
  fs.readFile("empregados.json", "utf8", (err, data) => {
    if (err) {
      callback(err)
    }
    try {
      const funcionario = JSON.parse(data)
      callback(null, funcionario)
    } catch (error) {
      callback(error)
    }
  })
}

export {
  escreverDadosFuncionarios,
  lerDadosFuncionarios
}