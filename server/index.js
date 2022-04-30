const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;
const secp = require('@noble/secp256k1');

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

// 1
let privateKey1 = secp.utils.randomPrivateKey();
privateKey1 = Buffer.from(privateKey1).toString('hex');
//privateKey1 = '0x' + privateKey1
console.log(privateKey1.length);

let publicKey1 = secp.getPublicKey(privateKey1);
publicKey1 = Buffer.from(publicKey1).toString('hex');
publicKey1 = '0x'+publicKey1.slice(publicKey1.length - 40);
console.log(publicKey1);

// 2
let privateKey2 = secp.utils.randomPrivateKey();
privateKey2 = Buffer.from(privateKey2).toString('hex');
//privateKey2 = '0x' + privateKey2
console.log(privateKey2);

let publicKey2 = secp.getPublicKey(privateKey2);
publicKey2 = Buffer.from(publicKey2).toString('hex');
publicKey2 = '0x'+ publicKey2.slice(publicKey2.length - 40);
console.log(publicKey2);

// 3
let privateKey3a = secp.utils.randomPrivateKey();
privateKey3 = Buffer.from(privateKey3a).toString('hex');
//privateKey3 = '0x' + privateKey3
console.log(privateKey3);

let publicKey3 = secp.getPublicKey(privateKey3);
publicKey3 = Buffer.from(publicKey3).toString('hex');
publicKey3 = '0x'+publicKey3.slice(publicKey3.length - 40);
console.log(publicKey3);

const balances = {
  [publicKey1]: 100,
  [publicKey2]: 50,
  [publicKey3]: 75,
}

const availAccounts = [{
  publicKey: publicKey1,
  balance: balances[publicKey1],
  privateKey: privateKey1
},{
  publicKey: publicKey2,
  balance: balances[publicKey2],
  privateKey: privateKey2
},{
  publicKey: publicKey3,
  balance: balances[publicKey3],
  privateKey: privateKey3
}]
app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  (async()=> {
  const {sender, recipient, amount, privateKey} = req.body;
  if (privateKey.length === 64){
    const msgHash =  await secp.utils.sha256("Message to hash");
    const privKey = Uint8Array.from(Buffer.from(privateKey, 'hex'));
    const sig = await secp.sign(msgHash, privKey);
    const pubKey = secp.recoverPublicKey(msgHash, sig, 1);
    const isValid = secp.verify(sig, msgHash, pubKey);

    let pubKeyETH = Buffer.from(pubKey).toString('hex');
    pubKeyETH = '0x'+pubKeyETH.slice(pubKeyETH.length - 40);
    
    if(isValid === true && pubKeyETH === sender){
      balances[sender] -= amount;
      balances[recipient] = (balances[recipient] || 0) + +amount;
      res.send({ balance: balances[sender] });
    } else { console.log("Not a valid transaction") }
} else { console.log ("Not a valid transaction!")}
})()
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  console.log(`Available Accounts \n=================== \n`);
  for(let i = 0; i<availAccounts.length;i++){
    console.log(`(${i})  ${availAccounts[i].publicKey} (${availAccounts[i].balance} ETH)\n`)
  }

  console.log(`\nPrivate Keys\n=================== \n`);
  for(let i = 0; i<availAccounts.length;i++){
    console.log(`(${i}) ${availAccounts[i].privateKey} \n`)
  }
});
