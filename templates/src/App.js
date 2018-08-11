import React, { Component } from 'react';
import './App.css';
import { Metamask, Gas, ContractLoader, Transactions, Events, Scaler, Blockie, Address, Button } from "dapparatus"
import Web3 from 'web3';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: false,
      account: false,
      gwei: 4,
    }
  }
  handleInput(e){
    let update = {}
    update[e.target.name] = e.target.value
    this.setState(update)
  }
  render() {
    let {web3,account,contracts,tx,gwei,block,avgBlockTime,etherscan} = this.state
    let connectedDisplay = ""
    let contractsDisplay = ""
    if(web3){
     connectedDisplay = (
       <div>
        <Gas
           onUpdate={(state)=>{
             console.log("Gas price update:",state)
             this.setState(state,()=>{
               console.log("GWEI set:",this.state)
             })
           }}
         />
         <ContractLoader
            web3={web3}
            require={path => {return require(`${__dirname}/${path}`)}}
            onReady={(contracts)=>{
              console.log("contracts loaded",contracts)
              this.setState({contracts:contracts})
            }}
         />
         <Transactions
            account={account}
            gwei={gwei}
            web3={web3}
            block={block}
            avgBlockTime={avgBlockTime}
            etherscan={etherscan}
            onReady={(state)=>{
              //loads in tx() function
              // use to send transactions: tx(contracts.YOURCONTRACT.YOURFUNCTION(),GASLIMIT)
              console.log("Transactions component is ready:",state)
              this.setState(state)
            }}
          />

       </div>
     )

      if(contracts){

        let buttonColor = "green"

        if(this.state.doingTransaction){
          buttonColor = "orange"
        }

        contractsDisplay = (
          <div style={{padding:30}}>
            <div>
              <Address
                {...this.state}
                address={contracts.Broadcaster._address}
              />
            </div>
            broadcast string: <input
                style={{verticalAlign:"middle",width:400,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
                type="text" name="broadcastText" value={this.state.broadcastText} onChange={this.handleInput.bind(this)}
            />
            <Button color={buttonColor} size="2" onClick={()=>{
                this.setState({doingTransaction:true})
                tx(contracts.Broadcaster.broadcast(this.state.broadcastText),45000,(receipt)=>{
                  console.log("receipt",receipt)
                  this.setState({broadcastText:""})
                })
              }}>
              Send
            </Button>
          </div>
        )
      }

    }
    return (
      <div className="App">
        <Metamask
          config={{requiredNetwork:['Unknown','Rinkeby']}}
          onUpdate={(state)=>{
           console.log("metamask state update:",state)
           if(state.web3Provider) {
             state.web3 = new Web3(state.web3Provider)
             this.setState(state)
           }
          }}
        />
        {connectedDisplay}
        {contractsDisplay}
      </div>
    );
  }
}

export default App;
