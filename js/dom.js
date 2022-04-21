function createElement(tagName, attributes, childnodes) {
	let node = document.createElement(tagName);
	if(attributes) {
		for(let key in attributes) {
			node.setAttribute(key, attributes[key]);
		}
	}
	if(childnodes) {
		for(let i=0; i<childnodes.length; ++i) {
			node.appendChild((childnodes[i] instanceof Node) ? childnodes[i] : document.createTextNode(childnodes[i].toString()));
		}
	}
	return node;
}