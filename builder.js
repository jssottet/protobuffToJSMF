/**
*   Example app that build a JSMF model from a protobuf message (using protobufjs)
*   @licence MIT
*   @Author Jean-Sébastien Sottet
*/

const ProtoBuf = require("protobufjs"),
    fs = require("fs"),
    JSMF = require('jsmf-core'),
    Model = JSMF.Model,
    JSMFProtoBuf = require('./jsmfBuilder.js'),
    MMProto = JSMFProtoBuf.metamodel,
    _ = require('lodash');
    
var builder = ProtoBuf.loadProtoFile(("./ic3data.proto"));
var message = builder.build("edu.psu.cse.siis.ic3.Application"); //"edu.psu.cse.siis.ic3"

var buffer = fs.readFileSync('./app_examples/a2dp.Vol_107.dat');

var mymsg = message.decode(buffer);

//Create a new model "Mapp" and entry point JSMF instance "application"
var MApp = new Model('App')
var MMApplication = getMMClass(MMProto,'Application')
var application = MMApplication.newInstance();

//set model to Flexible to address the Long object case (type defined in external library Long.js).
// => that works with JSMF using a dynamic typing : setFlexible = true.
MMApplication.setFlexible(true);
MApp.add(application);

//Popuplate the attributes
setAttributeFromM2('Application',application,mymsg);

//give a starting point for the function buildModel
buildModel('Application',application,mymsg);

//display all intents attributes pertaining of the first component of the application of the first application (- there is a priori only one app per file -)
_.map(MApp.modellingElements.Application[0].components[0].exit_points, x => {
           (x.intents!=undefined && console.log(x.intents[0].attributes[0].value))
    }
);

//Display the multivalued attribte of application and Long (object) for analysis_start
console.log(MApp.modellingElements.Application[0].used_permissions, MApp.modellingElements.Application[0].analysis_start)

/**
* @param MMType {String} identifier/name of the metamodel element
* @param MElem {JSMF Instance} a modelling element to be populated
* @param sourceObj {Object} a javascript raw/original object provided by the parsed source/tool
*/
function setAttributeFromM2 (MMtype, MElem, sourceObj) {
    var compo = getMMClass(MMProto,MMtype);
 
    _.forEach(compo.attributes, (x,y) => 
        {
            var currentElem = sourceObj==null ? null: sourceObj[y];
          
            if(currentElem!== null){   
                if(currentElem!==undefined && (currentElem.length==undefined || currentElem.length>0)) {
                    if(_.isArray(currentElem)) { //it is a multivalued attribute
                          MElem[y]=sourceObj[y]
                    } else {
                        MElem[y]=sourceObj[y]
                    }
                }
            }
        });   
}

/**
* @param MMtype {String} identifier/name of the metamodel element
* @param MElem {JSMF Instance} a modelling element to be populated
* @param sourceObj {Object} a javascript raw/original object provided by the parsed source/tool
*/
//Warning should avoid cyclic relations
function buildModel(MMtype,MElem,sourceObj) {
    var compo = getMMClass(MMProto,MMtype);
    
     // Getting through the metamodel all the references
      _.forEach(compo.references, (x,refName) => {
            var currentType= x.type
            //set the current relation Name (to be invoked after the creation of element).
            var stringAddRel = 'add'+toTitleCase(refName)
          
            var targetObj = sourceObj[refName];
            if(!_.isArray(targetObj)) { targetObj=[targetObj] }
          
            _.forEach(targetObj, curr => {
//                 if(currentType.__name=="Instruction"){console.log('t',sourceObj[refName],curr)}; 
                var cModelElement = currentType.newInstance();
                MElem[stringAddRel](cModelElement); 
                setAttributeFromM2(currentType.__name,cModelElement,curr)
                //recCall
                buildModel(currentType.__name,cModelElement,curr)
          })
    });
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