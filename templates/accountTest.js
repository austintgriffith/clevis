/*

  run from parent directory:

  mocha tests/account.js

*/
const clevis = require("clevis")
const assert = require("assert")
const colors = require('colors')


//--------------------------------------------------------//

testAccounts()

//--------------------------------------------------------//

function testAccounts(){
  describe('#accounts()', function() {
    it('should have at least one accounts to work with', async function() {
      const accounts = await clevis("accounts")
      console.log(accounts)
      assert(accounts.length > 0)
    });
  });
}
