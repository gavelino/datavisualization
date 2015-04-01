import java.util.List;


public class Information {
	private String edgeId;
	private String category;
	private String categoryId;
	
	public Information(String edgeId, String category, String categoryId) {
		super();
		this.edgeId = edgeId;
		this.category = category;
		this.categoryId = categoryId;
	}
	
	public String getEdgeId() {
		return edgeId;
	}
	public String getCategory() {
		return category;
	}
	public String getCategoryId() {
		return categoryId;
	}
	
	
}
