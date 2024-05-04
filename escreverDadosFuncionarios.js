import fs from 'node:fs'

const escreverDadosFuncionarios = (callback,funcionarios) => {
  fs.writeFile("empregados.json", JSON.stringify(funcionarios, null, 2), (err) => {
    if (err) {
      callback(err)
    }
    callback(null)
  })
}
export default escreverDadosFuncionarios