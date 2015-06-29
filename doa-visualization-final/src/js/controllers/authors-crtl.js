/**
 * Authors Controller
 */

angular
    .module('RDash')
    .controller('AuthorsCtrl', ['$scope', AuthorsCtrl]);

function AuthorsCtrl($scope) {
    //$('.page').html('Home / Authors');  

    var width = 600;
    var height = 500;   
    
    var getRepositoryName = function(str){return str.substring(str.search("/")+1, str.length)};
      
    var appData = [];   
    var workload = [];
    var repositories = new Object;    
    console.log("loading file... ");  
    d3.csv("data/new/best-authors-multi-add.csv", function(d) {
      return {
        repository: getRepositoryName(d.fullname),
        developer: d.username,
        numfiles: d.count
      };
    }, function(error, rows) {
        
        console.log("file loaded. "+ rows.length);
        
        rows.forEach(function(x){
            if (typeof(repositories[x.repository]) == "undefined"){
                repositories[x.repository] =  {developers: new Object};
            }
            if (typeof(repositories[x.repository].developers[x.developer]) == "undefined"){
                repositories[x.repository].developers[x.developer] =  x.numfiles;
            }
        });
        var tempAppData = []
        //appData = rows;
        for (repName in repositories){
            var devs =  repositories[repName].developers;
            var nRepFiles = 0;
            if(repName == "yiisoft-yii2")
                console.log(repName);
            for (dev in devs){
                var nDevs = parseInt(devs[dev]);
                nRepFiles += isNaN(nDevs)?0:nDevs;
            }
            
            for (dev in devs){;
                var perc = (devs[dev]/nRepFiles);
                if (isNaN(perc)) perc = 0;
                tempAppData.push({"repository" : repName,
                        "developer" : dev,
                        "perc" : perc});
            }
               
        }

        var nMaxDev = 20;
        for (repName in repositories){
            var data = tempAppData.filter((function(x){return x.repository == repName;}));
            for (var i = 0; i<nMaxDev; i++){
                if (data[i] == undefined)
                    appData.push({repository: repName, developer: "no-dev"+i, perc: 0, index : i} );
                else
                    appData.push({repository: repName, developer: data[i].developer, perc: data[i].perc, index : i} );
            }
        }
        
        var visualization = d3plus.viz()
                        .container("#viz1")
                        .type("bar")
                        .data(appData)
                        .y({"value":"perc", "stacked" : true, "label": "Total Files (%)"})
                        .x({"value":"repository", "padding" : 0.1 , "label" : "Repository"} )
                        .id(["index"])
                        .text({"text" : function(x){return x.repository + " :\n" + x.developer;}})
                        .zoom(true)
                        //.footer("kjhk")
                        //.width({"value": width})
                        //.height({"value": height})
                        .color(colorf)
                        .legend(false)
                        //.aggs({"value": "index"})
                        
                       // .ui([{ "method" : "x", "value"  : [ "repository" , "index" ]}])
                        .draw();
        
    });
      
    var getOrderDevelopers = function(repName){
        var devObjects = repositories[repName].developers;
        var devs = [];
        for (d in devObjects) {
            //console.log(d+": "+devObjects[d]);
            devs.push({username : d, files: devObjects[d].files});
        }
        
        return devs.sort(function(a, b){return b.files.length - a.files.length});
    }  
    
    var getNumFiles = function(devs){
        var uniqueFiles =  new Object;
        var count = 0;
        devs.forEach(function(dev){
            var files = dev.files;
            files.forEach(function(file){
                if (typeof(uniqueFiles[file.path]) == "undefined"){
                    uniqueFiles[file.path] =  1;
                    count++;
                }
            });
        });
        return count;
    }
    
    var splitDevs = function(devs){
        var size;
        var ndevs = devs.length;
        var newDevs = devs.slice(0);
        if (ndevs<10)
            size = 1;
        else
            size = Math.round(ndevs/10);
        var chunks = []
        for(i=0; i<9; i++){
            if(newDevs.length>0)
                chunks.push(newDevs.splice(0,size));
            else
                chunks.push([]);
        }
        chunks.push(newDevs);
        return chunks;   
    }
var countc = 0;
var colors =     ["#393b79","#5254a3","#6b6ecf","#9c9ede","#637939","#8ca252","#b5cf6b","#cedb9c","#8c6d31","#bd9e39","#e7ba52","#e7cb94","#843c39","#ad494a","#d6616b","#e7969c","#7b4173","#a55194","#ce6dbd","#de9ed6","#1f77b4",
 "#aec7e8", "#ff7f0e","#ffbb78","#2ca02c","#98df8a","#98df8a","#98df8a","#98df8a","#d62728","#ff9896","#9467bd","#c5b0d5","#8c564b","#c49c94","#e377c2","#f7b6d2","#7f7f7f","#c7c7c7","#bcbd22","#dbdb8d","#17becf","#9edae5"];
      
   var colorf = function(x){         
       return colors[x.index];
   }
}