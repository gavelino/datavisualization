/**
 * Authors Controller
 */

angular
    .module('RDash')
    .controller('DevMultAuthorsCtrl', ['$scope', DevMultAuthorsCtrl]);

function DevMultAuthorsCtrl($scope) {
  $('.breadcrumb-links').text('Home / Dev Multi-Authors');
  //var width = 650;
  //var height = 400;   
    
  var hashCode = function(s){
    return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
  }
 
  var quartile = function(array, percent){ /** @param percent - pass 25 for lower quartile, 75 for upper, 50 for mean. Defaults to 50 */
             if (!percent) percent = 50;
             array = array.sort(function(a, b){return a-b});
             var n = Math.round(array.length * percent / 100);
             return array[n];
  }
    
    var appData = [];
    var appData2 = [];
    var nfiles = [];
    var sizes = [];
    d3.csv("data/new/dev-multauthor-multi-add.csv", function(d) {
      nfiles.push(d.selectedfiles);
      return {
        repository: getRepositoryName(d.fullname),
        language: (d.language == "C" ? "C-Cpp": d.language).replace("C++","C-Cpp"),
        numfiles: d.selectedfiles,      
        numauthors: parseInt(d.numauthors),
        nummultauthors: parseInt(d.nummultauthors),
        numdevelopers: parseInt(d.numdevelopers),
        percentual: parseFloat((d.numauthors/d.numdevelopers).toFixed(2)),
        percentualmult: parseFloat((d.nummultauthors/d.numdevelopers).toFixed(2))
      };
    }, function(error, rows) {
        var q1 = quartile(nfiles, 25);
        var q3 = quartile(nfiles, 75);
        rows.forEach(function(x){var n =  parseInt(x.numfiles);
        x["size"] = n <q1 ? "Small":(n<=q3?"Medium":"Large");sizes.push(x.size);});
        
        appData = addAll(rows);
        appData2 = triplicate(appData);
        //printInfo(appData);
        
        drawBoxPlots();
    });
    
    var printInfo = function(data){
        data.forEach(function(x){
           console.log(x.repository+";"+x.language+";"+x.numfiles+";"+x.nummultauthors+";"+x.numdevelopers+";"+x.percentualmult+";"+x.size); 
        });
    }
    var getRepositoryName = function(str){return str.substring(str.search("/")+1, str.length)};
    
    var addAll = function(rows){
        var newRows = rows;
        rows.forEach(function(x){
            newRows.push({
                repository: x.repository,
                language: "All",
                numfiles: x.selectedfiles,
                numauthors: x.numauthors,
                nummultauthors: x.nummultauthors,
                numdevelopers: x.numdevelopers,
                percentual: x.percentual,
                percentualmult: x.percentualmult,
                size : "All"
            });
        });
        return newRows;
    }
    var triplicate = function(rows){
        var newRows = [];
        rows.forEach(function(x){
            newRows.push({
                repository: x.repository,
                language: x.language,
                numfiles: x.selectedfiles,
                numauthors: x.numauthors,
                nummultauthors: x.nummultauthors,
                numdevelopers: x.numdevelopers,
                percentual: x.percentual,
                percentualmult: x.percentualmult,
                size : x.size,
                "value" : x.numdevelopers,
                "type" : "Developers"
            });
            newRows.push({
                repository: x.repository,
                language: x.language,
                numfiles: x.selectedfiles,
                numauthors: x.numauthors,
                nummultauthors: x.nummultauthors,
                numdevelopers: x.numdevelopers,
                percentual: x.percentual,
                percentualmult: x.percentualmult,
                size : x.size,
                "value" : x.nummultauthors,
                "type" : "Multiauthors"
            });
            newRows.push({
                repository: x.repository,
                language: x.language,
                numfiles: x.selectedfiles,
                numauthors: x.numauthors,
                nummultauthors: x.nummultauthors,
                numdevelopers: x.numdevelopers,
                percentual: x.percentual,
                percentualmult: x.percentualmult,
                size : x.size,
                "value" : x.numauthors,
                "type" : "Authors"
            });
        });
        return newRows;
    }
    
    
    var drawBoxPlots = function(){
        /*var visualization1 = d3plus.viz()
        .container("#viz1")
        .data(appData)
        .type("box")
        .id("repository")
        .x("language")
        .y({"value": "percentual", "range": [0,1], "label": "Percentage"})
        .width({"value": width})
        .height({"value": height})
        .draw();*/
        
        var visualization2 = d3plus.viz()
        .container("#viz2")
        .data(appData)
        .type("box")
        .id("repository")
        .x({"value": "language"})
        .y({"value": "percentualmult", "label": "Percentage", "range": [0,1]})
        //.width({"value": width})
        //.height({"value": height})
        .order({"value":"language", "sort" : "asc"})
        .draw();
        
        drawSize1();
        //drawSize2();
        
    }
    var print = function(){
        var str = "";
        appData.forEach(function(x) {str += x.repository+";"+x.size+"\n";});
        console.log(str);
    }
    
    var changeOrderByLanguage = function(data){
        newData = data;        
        newData.forEach(function(x){
            if (x.size == "All")
                x.key = 0;
            if (x.size == "C-Cpp")
                x.key = 1;
            if (x.size == "Java")
                x.key = 2;
            if (x.size == "JavaScript")
                x.key = 3;
            if (x.size == "PHP")
                x.key = 4;
            if (x.size == "Python")
                x.key = 5;
            if (x.size == "Ruby")
                x.key = 6;
        });
        return newData;
    }
    var changeOrderBySize = function(data){
        newData = data;        
        newData.forEach(function(x){
            if (x.size == "All")
                x.key = 0;
            if (x.size == "Small")
                x.key = 1;
            if (x.size == "Medium")
                x.key = 2;
            if (x.size == "Large")
                x.key = 3;
        });
        return newData;
    }
    
    //var width2 = 300;
    //var height2 = 250; 
 
    function drawSize1(){

        var visualization = d3plus.viz()
            .container("#viz3")
            .data({"value" : changeOrderBySize(appData), "sort":true})
            .type("box")
            .id(["repository", "size"])
            .x("size")
            .y({"value": "percentualmult", "label": "Percentage", "range": [0,1]})
            //.width({"value": width})
            //.height({"value": height})
            .order({"value":"key", "sort" : "asc"})
            .draw();
    }
    
    function drawSize2(){

        var visualization = d3plus.viz()
            .container("#viz4")
            .data(appData2.filter(function(x){return x.size == "Small";}))
            .type("box")
            .id("repository")
            .x({"value":"type", "label": "Small"})
            .y("value")
            //.width({"value": width2})
            //.height({"value": height2})
            .draw();
        var visualization = d3plus.viz()
            .container("#viz5")
            .data(appData2.filter(function(x){return x.size == "Medium";}))
            .type("box")
            .id("repository")
            .x({"value":"type", "label": "Medium"})
            .y("value")
            //.width({"value": width2})
            //.height({"value": height2})
            .draw();
        var visualization = d3plus.viz()
            .container("#viz6")
            .data(appData2.filter(function(x){return x.size == "Large";}))
            .type("box")
            .id("repository")
            .x({"value":"type", "label": "Large"})
            .y({"value": "value", "range": [0,2400]})
            //.width({"value": width2})
            //.height({"value": height2})
            .draw();
        var visualization = d3plus.viz()
            .container("#viz7")
            .data(appData2.filter(function(x){return x.size == "All";}))
            .type("box")
            .id("repository")
            .x({"value":"type", "label": "All"})
            .y({"value": "value", "range": [0,700]})
            //.width({"value": width2})
            //.height({"value": height2})
            .draw();
    }
}