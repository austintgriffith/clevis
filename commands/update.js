let axios = require('axios')
let fs = require('fs')
//usage: clevis update
module.exports = async (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> UPDATE")
  return await update(params)
}
function update(params) {
  const DEBUG = params.config.DEBUG;
  return new Promise((resolve, reject) => {
     axios.get("https://ethgasstation.info/json/ethgasAPI.json")
   	.then((response)=>{
       let newgas = response.data.average/10+0.1;
       let clevis = JSON.parse(fs.readFileSync("clevis.json").toString())
       clevis.gasprice = newgas
       axios.get("https://api.coinmarketcap.com/v2/ticker/1027/")
       .then((response)=>{
         clevis.ethprice = response.data.data.quotes.USD.price
         let result = JSON.stringify(clevis,null, 2)
         fs.writeFileSync("clevis.json",result)
         resolve(result)
       })
   	})
  })
}
