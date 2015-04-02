import java.util.HashMap;
import java.util.List;
import java.util.Map;


public class Edge {
	String edgeId;
	Map<String, Integer> mapCategories;
	public Edge(String edgeId) {
		mapCategories = new HashMap<String, Integer>();
		this.edgeId = edgeId;
	}
	public Edge(String edgeId, List<Information> informations) {
		mapCategories = new HashMap<String, Integer>();
		this.edgeId = edgeId;
		for (Information information : informations) {
			this.addInformation(information);
		}
	}
	
	public void addInformation(Information info){
		if (!mapCategories.containsKey(info.getCategory())){
			mapCategories.put(info.getCategory(), 0);
		}
		Integer count = mapCategories.get(info.getCategory());
		mapCategories.put(info.getCategory(), count+1);
	}
	
	public String getFormatedCSV(){
		String str = "";
		for (char c ='A'; c <= 'Z'; c++) {
			if (mapCategories.containsKey(Character.toString(c))){
				str += mapCategories.get(Character.toString(c));
			}
			str += ",";
		}
		return str;
	}
}
