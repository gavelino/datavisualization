String.prototype.hashCode = function() {
    var hash = 0, i, chr, len;
    if (this.length == 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};


// Daqui para baixo são funcões para calcular a similaridade e posição das pessoas.
function computeStatistics(appData) {
	var n = 0;
	var centroid = personToVector({});
	var maxNorm = 0;
	var minNorm = 1000;
	var idf = personToVector({});
	var sim = {};
	
	for (var graph in appData.graphs) {
		for (var p in appData.graphs[graph]) {
			var vector = personToVector(appData.graphs[graph][p]);
			for (var i = 0; i < vector.length; i++) {
				centroid[i] += vector[i];
				if (vector[i] > 0) {
					idf[i]++;
				}
			}
			var norm = vectorNorm(vector);
			maxNorm = Math.max(maxNorm, norm);
			minNorm = Math.min(minNorm, norm);
			n++;
		}
	}
	for (var i = 0; i < centroid.length; i++) {
		centroid[i] = centroid[i] / n;
		idf[i] = Math.log(n/(1 + idf[i]));
	}
	var minSim = 1;
	var maxSim = 0;
	for (var graph in appData.graphs) {
		sim[graph] = {};
		for (var p in appData.graphs[graph]) {
			var person = appData.graphs[graph][p];
			var vector = personToVector(person);
			sim[graph][p] = cosineSimilarity(vector, centroid);
			minSim = Math.min(minSim, sim[graph][p]);
			maxSim = Math.max(maxSim, sim[graph][p]);
		}
	}
	return {
		n: n,
		centroid: centroid,
		idf: idf,
		maxNorm: maxNorm,
		minNorm: minNorm,
		minSim: minSim,
		maxSim: maxSim,
		sim: sim
	};
}

function personToVector(personData) {
	var charCodeA = "A".charCodeAt(0);
	var charCodeZ = "Z".charCodeAt(0);
	var vector = [];
	for (var i = charCodeA; i <= charCodeZ; i++) {
		var locations = personData[String.fromCharCode(i)] || [];
		vector.push(locations.length);
	}
	return vector;
}

function cosineSimilarity(vector1, vector2) {
	var r = vectorDotProduct(vector1, vector2) / (vectorNorm(vector1) * vectorNorm(vector2));
	return r;
}
//function centeredCosineSimilarity(vector1, vector2) {
//	var avg = personToVector({});
//	var v1 = personToVector({});
//	var v2 = personToVector({});
//	avg = vectorAvg(avg, vector1, vector2);
//	v1 = vectorMinus(v1, vector1, avg);
//	v2 = vectorMinus(v2, vector2, avg);
//	return cosineSimilarity(v1, v2);
//}
//function vectorAvg(result, vector1, vector2) {
//	for (var i = 0; i < result.length; i++) {
//		result[i] = (vector1[i] + vector2[i]) / 2;
//	}
//	return result;
//}
//function vectorMinus(result, vector1, vector2) {
//	for (var i = 0; i < result.length; i++) {
//		result[i] = vector1[i] - vector2[i];
//	}
//	return result;
//}
function vectorNorm(vector1) {
	var norm = 0;
	for (var i = 0; i < vector1.length; i++) {
		norm += vector1[i] * vector1[i];
	}
	return Math.sqrt(norm);
}
function vectorDotProduct(vector1, vector2) {
	var result = 0;
	for (var i = 0; i < vector1.length; i++) {
		result += vector1[i] * vector2[i];
	}
	return result;
}
function computePosition(i, j, person, width, height, radius) {
	var xpos = ((stats.maxSim - stats.sim[i][j])/(stats.maxSim - stats.minSim)) * (width - 2*radius);
	
	var norm = vectorNorm(personToVector(person));
	var delta = (stats.maxNorm - norm) / (stats.maxNorm - stats.minNorm);
	var pos = (delta * (height - 2*radius));
	var ypos = pos;
	
	return [xpos, ypos];
}
