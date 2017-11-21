module.exports = (params)=>{
  console.log("Creating config file: clevis.json")
  let init = params.fs.readFileSync(__dirname+"/../templates/config.json").toString()
  params.fs.writeFileSync("clevis.json",init);
  let ignore = params.fs.readFileSync(__dirname+"/../templates/gitignore").toString()
  if (params.fs.existsSync(".gitignore")) {
    console.log("Adding .gitignore too...")
    params.fs.writeFileSync(".gitignore",ignore);
  }
  return init
}
