const SHA256 = require('crypto-js/sha256');
const dbInterface = require('./dbInterface.js');

// Block class
class Block {
	constructor(data) {
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
  }
}

Block.prototype.toString = function () {
  return 'Block #' + this.height + ", hash: " + this.hash + ", body: " + this.body;
}

// Blockchain class
class Blockchain {
  constructor() {
  }

  async addBlock(newBlock) {
    var blockHeight = await this.getBlockHeight();
    newBlock.height = blockHeight + 1; // block height
    newBlock.time = new Date().getTime().toString().slice(0,-3); // timestamp is in UTC format

    if (blockHeight > 0) {
      var lastBlock = await dbInterface.getBlock(blockHeight);
      newBlock.previousBlockHash = lastBlock.hash; // getting the previous block hash
    }

    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString(); // hashing the block with SHA256
    dbInterface.addBlock(newBlock.height, newBlock)
    .then(function () {
      console.log("Successfully added block #" + newBlock.height);
    }).catch(function (err) {
      console.log(err);
      console.log("Encountered error while adding block #" + newBlock.height);
    })
  }

  async getBlockHeight() {
    var height = await dbInterface.getBlockHeight();
    return height;
  }

  async getBlock(blockHeight) {
    var block = await dbInterface.getBlock(blockHeight);
    return block; // returns block at blockHeight as a JSON object
  }

  validateBlock(originalBlock){
    let block = JSON.parse(JSON.stringify(originalBlock)) // copying a block
    let blockHash = block.hash; // get block's hash

    block.hash = ''; // removing block hash
    let validBlockHash = SHA256(JSON.stringify(block)).toString(); // generate a proper hash
    if (blockHash === validBlockHash) { // comparing current block hash to a valid block hash
        return true;
    } else {
        console.log('Block #' + block.height + ' invalid hash:\n' + blockHash + ' <> ' + validBlockHash); // else print an error and return False
        return false;
    }
  }

  validateChain() { // validate the whole chain
    let errorLog = [];
    
    dbInterface.getAllBlocks()
    .then((blocks) => {
      for (var i = 1; i < blocks.length - 1; i++) {
        var block = blocks[i];
        // validate block
        if (!this.validateBlock(block)) errorLog.push(i);
        
        // compare blocks hash link
        let blockHash = block.hash;
        let previousHash = blocks[i + 1].previousBlockHash;
        if (blockHash !== previousHash) {
          console.log("Block #" + block.height + "invalid: " + blockHash + " <> " + previousHash);
          errorLog.push(i);
        }
      }

      if (errorLog.length > 0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: ' + errorLog);
      } else {
        console.log('No errors detected');
      }
    })
  }
}

module.exports = {Block: Block, Blockchain: Blockchain}