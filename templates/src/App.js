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
  render() {
    let {web3,account,contracts,tx,gwei,block,avgBlockTime,etherscan} = this.state
    let connectedDisplay = ""
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
       </div>
     )
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
      </div>
    );
  }
}

export default App;
