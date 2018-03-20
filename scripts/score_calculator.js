var preparedWeights = [4,4,5,5,5,5,5,5,2,3,3,10,10,10];
var impromptuWeights = [2,1,1,1,2,2,2,1,1,1,1,3,3,3];
var prepared = "prepared";
var impromptu = "impromptu";

var speakerNames = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
var scores = 			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var preparedFaults = 	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var impromptuFaults = 	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var finalScores = 		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

for(var i = 0; i < 15; i++){
	getSpeakerName(i);
	addTimeFaultUpdater(i);
}
addAllUpdaters("J1P", prepared);
addAllUpdaters("J2P", prepared);
addAllUpdaters("J3P", prepared);

addAllUpdaters("J1I", impromptu);
addAllUpdaters("J2I", impromptu);
addAllUpdaters("J3I", impromptu);

function getSpeakerName(speakerNumber){
	var nameField = document.getElementById("P"+(speakerNumber+1));
	nameField.addEventListener("change", function(){
		speakerNames[speakerNumber] = this.value;
		//console.log(this.value);
		updateResults();
	});
}

function addAllUpdaters(sheet, type){

    for(var c = 0; c < 15; c++){
		//subtotal updaters
        for(var r = 0; r <= 1; r++){            
            addTotalUpdater(sheet, r, c, 0, 1, sheet+"subtotal1_C"+c);  
        }
        for(var r = 2; r <= 7; r++){            
            addTotalUpdater(sheet, r, c, 2, 7, sheet+"subtotal2_C"+c);  
        }
        for(var r = 8; r <= 10; r++){           
            addTotalUpdater(sheet, r, c, 8, 10, sheet+"subtotal3_C"+c); 
        }
        for(var r = 11; r <= 13; r++){          
            addTotalUpdater(sheet, r, c, 11, 13, sheet+"subtotal4_C"+c);
        }
        //total updater
        for(var r = 0; r <= 13; r++){
            addWeightedTotalUpdater(sheet, type, r, c, 0, 13, sheet+"total_C" + c);
        }
    }
}

function addTotalUpdater(sheet, row, col, fromRow, toRow, target){
    var cell = getCell(sheet, row, col);
    cell.addEventListener("change", function(){
            var sum = sumUnweighted(sheet, col, fromRow, toRow);
            var sub = document.getElementById(target);
            sub.innerHTML = sum;
        });
}

function addWeightedTotalUpdater(sheet, type, row, col, fromRow, toRow, target){
    var cell = getCell(sheet, row, col);
    cell.addEventListener("change", function(){
            var sum = sumWeighted(sheet, type, col, fromRow, toRow);
            var sub = document.getElementById(target);
            sub.innerHTML = sum.toFixed(1);
			
			scores[col] = finalScore(col);
			updateTotal(col);
        });
}

function addTimeFaultUpdater(speakerNum){
	for(var i = 1; i <= 2; i++){
		for(var j = 1; j<=2; j++){
			var cell = document.getElementById("T"+i+"r"+(speakerNum+1)+"c"+j);
			cell.addEventListener("change", function(){
				preparedFaults[speakerNum] = timeFault(getPreparedTime(speakerNum+1), 300, 360, 7);
				updateTotal(speakerNum);
			});
		}
		for(var j = 3; j<=4; j++){
			var cell = document.getElementById("T"+i+"r"+(speakerNum+1)+"c"+j);
			cell.addEventListener("change", function(){
				impromptuFaults[speakerNum] = timeFault(getImpromptuTime(speakerNum+1), 120, 180, 3);
				updateTotal(speakerNum);
			});
		}
	}
}

function finalScore(col){
	
	var total = 0;
	total += parseFloat(document.getElementById("J1Ptotal_C"+col).textContent);
	total += parseFloat(document.getElementById("J2Ptotal_C"+col).textContent);
	total += parseFloat(document.getElementById("J3Ptotal_C"+col).textContent);
	total += parseFloat(document.getElementById("J1Itotal_C"+col).textContent);
	total += parseFloat(document.getElementById("J2Itotal_C"+col).textContent);
	total += parseFloat(document.getElementById("J3Itotal_C"+col).textContent);
	//console.log(total);
	
	return total;
}

function sumUnweighted(sheet, col, fromRow, toRow){
    var total = 0;
        
    for(var row = fromRow; row <= toRow; row++){

        var v = getCell(sheet, row, col);
        if(v.value != null && v.value != ""){
            total += parseInt(v.value);
            //console.log(total);
        }
    }
    return total;
}

function sumWeighted(sheet, type, col, fromRow, toRow){
    var total = 0;
    var weights;
        
    if(type == prepared){
        weights = preparedWeights;
    }
    else if(type == impromptu){
        weights = impromptuWeights;
    }
    for(var row = fromRow; row <= toRow; row++){

        var v = getCell(sheet, row, col);
        if(v.value != null && v.value != ""){
            total += weightedValue(parseInt(v.value), weights[row]);
            //console.log(total);
        }
    }
    return total;
}

function updateTotal(speakerNum){
	finalScores[speakerNum] = scores[speakerNum]  - 3*(preparedFaults[speakerNum] + impromptuFaults[speakerNum]);
	updateResults();
}

function updateResults(){
	
	var order = [];
	for(var i = 0; i < 15; i++){
		if(speakerNames[i] == ""){
			//skip
		}
		else if(order.length <= 0 || finalScores[i] <= finalScores[order[i - 1]]){
			order.push(i);
		}
		else{
			for(var j = 0; j < order.length; j++){
				
				if(finalScores[i] > finalScores[order[j]]){
					order.splice(j, 0, i);
					break;
				}
			}
		}
	}
	
	for(var i = 0; i < order.length; i++){
		if(speakerNames[order[i]] != ""){
			document.getElementById("participant_name_"+i).textContent = speakerNames[order[i]];		
			document.getElementById("participant_score_"+i).textContent = parseFloat(finalScores[order[i]]).toFixed(1);
		}
		else{
			document.getElementById("participant_name_"+i).textContent = "";
			document.getElementById("participant_score_"+i).textContent = "";
		}
	}
}
function timeFault(time, min, max, maxFaults){
	console.log(time);
	if(isNaN(time) || time == 0){
		return 0;
	}
	else{
		//var faults = (Math.abs(time - ((max + min)/2)) - ((max-min)/2))/5;
		var faults = Math.ceil(Math.max((time - max),(min - time))/5);
		faults = Math.max(0, faults);
		return Math.min(faults, maxFaults);
	}
}
function getPreparedTime(speakerNum){
	var minutes = document.getElementById("T1r"+speakerNum+"c1").value;
	var seconds	= document.getElementById("T1r"+speakerNum+"c2").value;
	
	
	
	var time = parseTime(minutes)*60 + parseTime(seconds);

	return time;
}
function getImpromptuTime(speakerNum){
	var minutes = document.getElementById("T1r"+speakerNum+"c3").value;
	var seconds	= document.getElementById("T1r"+speakerNum+"c4").value;
	
	time = parseTime(minutes)*60 + parseTime(seconds);

	return time;
}
function getCell(sheet, row, col){  
        var id = sheet+"R"+row+"C"+col;
        return document.getElementById(id);     
}

function weightedValue (score, weight){
  wtdScore = score*weight/10;
  return wtdScore;
}
function parseTime(n){
	n = parseFloat(n);
	if(isNaN(n)) return 0;
	else return n;
}
