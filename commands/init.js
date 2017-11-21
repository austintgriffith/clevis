module.exports = (params)=>{
  let init = params.fs.readFileSync(__dirname+"/../templates/config.json").toString()
  params.fs.writeFileSync("clevis.json",init);
  return init
}
