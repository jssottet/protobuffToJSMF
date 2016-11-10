'use strict'

const peg = require('pegjs')
const fs = require('fs')
const JSMF = require('jsmf-core')

// the grammar.pegjs
var parser = peg.generate(fs.readFileSync('./grammar.pegjs','utf-8'))

//the protoBuf file defining the schema/metamodel of the data (here comming from IC3 analyser)
var MMProtoBuf = parser.parse(fs.readFileSync('./ic3data.proto','utf-8'),
                     JSMF)
//Exports the metamodel of IC3 protocol buffer metamodel
exports.metamodel = MMProtoBuf;
