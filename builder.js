const ProtoBuf = require("protobufjs"),
    fs = require("fs"),
    JSMF = require('jsmf-core'),
    Model = JSMF.Model,
    JSMFProtoBuf = require('./jsmfBuilder.js'),
    MMProto = JSMFProtoBuf.metamodel,
    _ = require('lodash');
  //  util = require("util");
    

var builder = ProtoBuf.loadProtoFile(("./ic3data.proto"));
var message = builder.build("edu.psu.cse.siis.ic3.Application"); //"edu.psu.cse.siis.ic3"

var buffer = fs.readFileSync('./app_examples/a2dp.Vol_107.dat');

var mymsg = message.decode(buffer);

//const application = MMProto.classes.Application[0].newInstance(mymsg.name);

var MApp = new Model('App')

var application = getMMClass(MMProto,'Application').newInstance({name:mymsg.name, version:mymsg.version});
MApp.add(application);

_.forEach(mymsg.components, x => {
                        var component = getMMClass(MMProto,'Component').newInstance({name:x.name})
                        application.addComponents(component)
                        MApp.add(component);
                      }
         );

//display all component of the first application (- there is a priori only one app per file -)
console.log(MApp.modellingElements.Application[0].components);
//MMProto.getClass('Application')


//Util function that will be part of JSMF
function getMMClass(metamodel, name) {
      
   return _.filter(metamodel.modellingElements.Class, function(x) {return x.__name == name})[0]
    
}

