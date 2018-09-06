const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

// Add data to levelDB with key/value pair
exports.addBlock = (height,block) => {
  return new Promise(function(resolve, reject) {
    db.put(height, JSON.stringify(block).toString(), function(err) {
      if (err) reject(err);
      resolve();  
    })
  });
}

// Get data from levelDB with key
exports.getBlock = (key) => {
  return new Promise(function(resolve, reject) {
    db.get(key, function(err, value) {
      if (err) reject(err);
      resolve(JSON.parse(value));
    })
  })
}

// loops through all the blocks to get the current block height and returns it

exports.getBlockHeight = () => {
  let height = 0;
  return new Promise(function (resolve, reject) {
    db.createReadStream()
    .on('data', function(data) {
      height++;
    })
    .on('error', function(err) {
      reject(err);
    })
    .on('close', function() {
      resolve(height);
    })
  });
}

// loops through all the blocks in db and returns them

exports.getAllBlocks = () => {
  let i = 0;
  let blocks = [];
  return new Promise(function(resolve, reject) {
    db.createReadStream()
    .on('data', function(data) {
      let block = JSON.parse(data.value);
      blocks[block.height] = block;
      i++;
    })
    .on('error', function(err) {
      reject(err);
    })
    .on('close', function() {
      resolve(blocks);
    })
  });  
}