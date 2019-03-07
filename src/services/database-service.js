"use strict"

const oracledb = require('oracledb');
const dbConfig = require('../config');

async function initialize() {   
  const pool = await oracledb.createPool(dbConfig.connStringSepd);
}

module.exports.initialize = initialize;

async function close() {
  await oracledb.getPool().close();
}

module.exports.close = close;

function comandText(statement, binds = [], opts = {}) {
  return new Promise(async (resolve, reject) => {
    let conn;
    opts.outFormat = oracledb.OBJECT;
    opts.autoCommit = true;
    
    try {         
      conn = await oracledb.getConnection();     
      const result = await conn.execute(statement, binds, opts);

      resolve(result);
    } catch (err) {
      reject(err);
      console.log(err);
    } finally {
      if (conn) {
        try {         
          await conn.close();      
        } catch (err) {
          console.log(err);
        }
      }
    }
  });
}

module.exports.comandText = comandText;