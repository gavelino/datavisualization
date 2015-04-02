import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.sound.midi.MidiDevice.Info;


public class Graph {
	private String id;
	private List<Information> informations;
	
	public Graph(String id) {
		this.id = id;
		this.informations = new ArrayList<Information>();
	}
	
	public String getId() {
		return id;
	}

	public List<Information> getInformations() {
		return informations;
	}

	public void setInformations(List<Information> informations) {
		this.informations = informations;
	}
	
	public void addInformation(Information information){
		this.informations.add(information);
	}
	

	public List<Edge> process(){
		Map<String, List<Information>> edgeMap = getInformationsByEdge();
		List<Edge> edges = new ArrayList<Edge>();
		for (Entry<String, List<Information>> entry : edgeMap.entrySet()) {
			edges.add(new Edge(entry.getKey(), entry.getValue()));
		}
		
		return edges;
	}

	private Map<String, Integer> getNewMapCategories() {
		Map<String, Integer> mapCategories = new HashMap<String, Integer>();
		for (char c ='A'; c <= 'Z'; c++) {
			mapCategories.put(Character.toString(c), 0);
		}
		return mapCategories;
	}

	private Map<String, List<Information>> getInformationsByEdge() {
		Map<String, List<Information>> edgeMap = new HashMap<String, List<Information>>();
		List<Information> currentlist = null;
		for (Information information : informations) {
			if (!edgeMap.containsKey(information.getEdgeId())){
				currentlist = new ArrayList<Information>();
				edgeMap.put(information.getEdgeId(), currentlist);
			}
			currentlist.add(information);
		}
		return null;
	}
}
