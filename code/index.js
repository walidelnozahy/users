const functions = {
  putUser: require('./putUser'),
  deleteUser: require('./deleteUser'),
  getUser: require('./getUser'),
  listUser: require('./listUser'),
  login: require('./login')
}

module.exports.run = async (inputs = {}) => {
  const { fn, data } = inputs
  return functions[fn](data)
}
