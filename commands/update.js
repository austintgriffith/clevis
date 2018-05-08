let axios = require('axios')
let fs = require('fs')
module.exports = async (params)=>{
  //const DEBUG = params.config.DEBUG;
  //if(DEBUG) console.log(" >>> ascii")
  axios.get("https://ethgasstation.info/json/ethgasAPI.json")
	.then((response)=>{
    let newgas = response.data.average/10+0.1;
    let clevis = JSON.parse(fs.readFileSync("clevis.json").toString())
    clevis.gasprice = newgas
    axios.get("https://api.coinmarketcap.com/v2/ticker/1027/")
    .then((response)=>{
      clevis.ethprice = response.data.data.quotes.USD.price
      let result = JSON.stringify(clevis,null, 2)
      console.log(result)
      fs.writeFileSync("clevis.json",result)
    })
	})
  return "Updating clevis.json...";
}
