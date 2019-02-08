'use strict';
const fs = require('fs-extra');
const glob = require('glob');  
const shajs = require('sha.js');
const pathLib = require('path');

var _getFilesHash = (path) => {
    let dmPath = pathLib.join(path, '/');
    let fullPath = pathLib.join(dmPath, '/')+"/**";
    let files = glob.sync(fullPath);
    
    let rootHash = shajs('sha256');
    var fileHash = "";
    
    var fileNameArr = "";
    var fileHashArr = "";
    var fEx = "";
    var hEx = "";
    
    console.log("");
    console.log("Total Files/Directory: "+files.length);
    
    var totalSize = 0;
    files.forEach(function(file){
        if(!fs.lstatSync(file).isDirectory()){
            var _filename = file.replace(dmPath, "");
            if(_filename != "_version"){
                var data = fs.readFileSync(file, 'utf8');
                
                totalSize += fs.statSync(file).size;
                
                rootHash.update(data);
                
                var fileHash = shajs('sha256');
                fileHash.update(data);
                fileHash = fileHash.digest('hex');
                
                fileNameArr += fEx + _filename;
                fileHashArr += hEx + fileHash;
                
                fEx = ",";
                hEx = ",";
            }
        }
    });
    
    var sizeKb = totalSize / 1000;
    console.log("Total Size: "+totalSize+" ["+sizeKb+" KB]");
    
    rootHash = rootHash.digest('hex');
    
    return rootHash +";"+ fileNameArr+";"+fileHashArr;
};

process.argv.forEach(function (val, index, array) {
    if(array.length < 3){
        console.log("Error: Invalid Path");
        process.exit(1);
    }
    
    if(index == 2){
        var path = val;
        if(!pathLib.isAbsolute(path)){
            console.log("Error: Invalid Path");
            process.exit(1);
        }
        
        if (fs.existsSync(path)) {
            var _allHash = _getFilesHash(path);
            
            if(_allHash != ''){
                console.log("");
                console.log("FilesHash:");
                console.log("");
                console.log(_allHash);
                console.log("");
            } else {
                console.log("Error: Hash not found");
                process.exit(1);
            }
        } else {
            console.log("Error: Invalid Path");
            process.exit(1);
        }
    }
});
