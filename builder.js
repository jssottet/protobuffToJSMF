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

//give a starting point for the function buildModel
buildModel('Application',application,mymsg);

//mymsg.components = source.relationName
/*
_.forEach(mymsg.components, x => {
                //Component = __name of targetted class
                var component = getMMClass(MMProto,'Component').newInstance()
                setAttributeFromM2('Component',component,x)
                application.addComponents(component)
                MApp.add(component);
              }
         );
*/

//display all component of the first application (- there is a priori only one app per file -)
console.log(MApp.modellingElements.Application[0].components[0].name);

//MMProto.getClass('Application')

function setAttributeFromM2 (MMtype, MElem, sourceObj) {
    var compo = getMMClass(MMProto,MMtype);
   // var newE = getMMClass(MMProto,'Component').newInstance();
    _.forEach(compo.attributes, (x,y) => 
        {
            var currentElem = sourceObj[y];
            if(currentElem!== null){   
                console.log(currentElem);
                if(currentElem!==undefined && (currentElem.length==undefined || currentElem.length>0)) {
                    //console.log(_.isArray(currentElem))
                    if(_.isArray(currentElem)) { 
                        console.log("Warning multi-valued attribute not supported yet => ignored")
                    } else {
                        MElem[y]=sourceObj[y]
                    }
                }
            }
        });   
}

//Warning should avoid cyclic relations
function buildModel(MMtype,MElem,sourceObj) {
    var compo = getMMClass(MMProto,MMtype);
      _.forEach(compo.references, (x,refName) => {
          var currentType= x.type
        _.forEach(sourceObj[refName], curr => {
            var cModelElement = x.type.newInstance()
            setAttributeFromM2(currentType.__name,cModelElement,curr)
            var stringAddRel = 'add'+toTitleCase(refName)
            MElem[stringAddRel](cModelElement); 
            //console.log(currentType.__name);
            //recCall
            buildModel(currentType.__name,cModelElement,curr)
      })
    });
    //console.log(MElem.components[1].name)
}

//Util function to make First letter uppercaseonly 
function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

//Util function that will be part of JSMF assuming there is only one Class of that name 
function getMMClass(metamodel, name) {    
   return _.filter(metamodel.modellingElements.Class, function(x) {return x.__name == name})[0]  
}