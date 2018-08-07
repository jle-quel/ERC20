'use strict';

const express = require('express');

// Constants
const PORT = 8085;
const HOST = '0.0.0.0';

const bodyParser = require("body-parser");


const app = express();

var util = require('util');


app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());
// App

var users = require('./db/users');


app.post('/query/', (req, res) => {

  users.comparepwd(req.body.username, req.body.password, function (err, result) {
    if (err) {
        res.send('{"status" : "403", "payload" : "", "message" : "Username/password invalid" }');
      //throw err;
    }
    else {
      console.log('user :' + JSON.stringify(result));
      if (result) {
        console.log('succesfully identified');

        var cc = req.body.chaincode;
        if (!cc) {
          //TODO : handle error
        }

        var channel = req.body.channel;
        if (!channel) {
          //TODO : handle error
        }

        var func = req.body.func;
        if (!func) {
          //TODO : handle error
        }

        var args = req.body.args;
        if (!args) {
          //TODO : handle error
        }

        //var peerAddr = 'grpc://localhost:7051';
        var peerAddr = process.env.PEER_ADDR;
        console.log("peerAddr=", peerAddr);
        //var peerListenerAddr = 'grpc://localhost:7053';
        var peerListenerAddr = process.env.PEER_LISTENER_ADDR;
        console.log("peerListenerAddr=", peerListenerAddr);
        //var ordererAddr = 'grpc://localhost:7050';
        var ordererAddr = process.env.ORDERER_ADDR;
        console.log("ordererAddr=", ordererAddr);






        const request = {
          //targets : --- letting this default to the peers assigned to the channel
          chaincodeId: cc,
          fcn: func,
          args: JSON.parse(args)
        };

        //console.log(req.body.param2);
        var query = require('./query.1.js');
        query.cc_query(req.body.username, request, channel, peerAddr, ordererAddr, peerListenerAddr).then(
          (result) => {

            console.log(result);

            res.send(result);
          }
        );



      }
      else
      {
        res.send('{"status" : "403", "payload" : "", "message" : "Username/password invalid" }');
      }
    }
  });


});

//TODO
app.post('/invoke/', (req, res) => {

  users.comparepwd(req.body.username, req.body.password, function (err, result) {
    if (err) {
        res.send('{"status" : "403", "payload" : "", "message" : "Username/password invalid" }');
      //throw err;
    }
    else {
      console.log('user :' + JSON.stringify(result));
      if (result) {
        console.log('succesfully identified');

  var cc = req.body.chaincode;
  if (!cc) {
    //TODO : handle error
  }

  var channel = req.body.channel;
  if (!channel) {
    //TODO : handle error
  }

  var func = req.body.func;
  if (!func) {
    //TODO : handle error
  }

  var args = req.body.args;
  if (!args) {
    //TODO : handle error
  }

  var request = {
    //targets : --- letting this default to the peers assigned to the channel
    chaincodeId: cc,
    fcn: func,
    args: JSON.parse(args),
    chainId: channel,
  };


  //var peerAddr = 'grpc://localhost:7051';
  var peerAddr = process.env.PEER_ADDR;
  console.log("peerAddr=", peerAddr);
  //var peerListenerAddr = 'grpc://localhost:7053';
  var peerListenerAddr = process.env.PEER_LISTENER_ADDR;
  console.log("peerListenerAddr=", peerListenerAddr);
  //var ordererAddr = 'grpc://localhost:7050';
  var ordererAddr = process.env.ORDERER_ADDR;
  console.log("ordererAddr=", ordererAddr);

  //console.log(req.body.param2);

  var query = require('./invoke.1.js');
  query.cc_invoke(req.body.username, request, channel, peerAddr, ordererAddr, peerListenerAddr).then(
    (result) => {

      console.log(result);

      res.send(result);
    }
  );

}
else
{
  res.send('{"status" : "403", "payload" : "", "message" : "Username/password invalid" }');
}
}
});


  //  res.send("{}");

});

//TODO
app.post('/listpeers/', (req, res) => {

  res.send("{}");

});

app.post('/register/', (req, res) => {


  var usr = req.body.username;
  if (!usr)
  { 
    //TODO : handle error
  }

  var password = req.body.password;
  if (!usr)
  { 
    //TODO : handle error
  }


//  var caAddr = "http://localhost:7054";

  var caAddr = process.env.CA_ADDR;
  console.log("caAddr=", caAddr);
  //console.log(req.body.param2);
  var query = require('./registerUser.1.js');
  query.ca_register(usr, caAddr).then(
    (result) => {
      console.log("res:"+result);

      if (JSON.parse(result).status == "failed")
      {
        res.send("{\"status\" : \"failed\", \"message\": \"User already exists\"}")
        return;
      }

      var user = {  
        email: usr,
        password: password,
        pubkey : JSON.parse(result).pubkey,
    };
    
    console.log("pw:" + user.email);
    var crypto = require('crypto');
    var hash = crypto.createHash('whirlpool');
    //passing the data to be hashed
    var data = hash.update(user.password, 'utf-8');
    //Creating the hash in the required format
    var gen_hash= data.digest('hex');
    
    console.log(gen_hash);
    user.password = gen_hash;
    
    users.create(user, function(err) {  
        if (err) {
              throw err;
                }
          else {
                console.log('user inserted');
            }
    });

  console.log(result);


  res.send(util.format("{\"status\" : \"ok\", \"message\": \"User registered successfully\", \"pubkey\" : \"%s\"}",JSON.parse(result).pubkey))
    }
  );

});

//TODO
app.post('/auth/', (req, res) => {

  users.comparepwd_pub(req.body.username, req.body.password, function (err, result) {
    if (err) {
        res.send('{"status" : "403", "payload" : "", "message" : "Username/password invalid" }');
      //throw err;
    }
    else {
      console.log('user :' + JSON.stringify(result));
      if (result.valid) {
        res.send(util.format('{"status" : "ok", "payload" : "", "message" : "", "pubkey" : "%s" }',result.pubkey));
        console.log('succesfully identified');
      }
      else{
        res.send('{"status" : "403", "payload" : "", "message" : "Username/password invalid" }');
      }

}
});
  //  res.send("{}");

});



app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
