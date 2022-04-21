const ItemPerPage = 11;

let contract;

let logs;

async function onAdapterLoad() {
	let page = (new URLSearchParams(location.search)).get('p') || 0;
	
	contract = new ethers.Contract(ContractAddr, [
		'function tokenURI(uint256 tokenId) view returns (string)',
		'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
		'function setMimeType(uint256 tokenId, string calldata value) public',
	], provider.getSigner());
	
	logs = await contract.queryFilter(contract.filters.Transfer('0x'+'0'.repeat(40)));

	let listNode = document.querySelector('#tokens');
	
	for(let i=0; i<ItemPerPage; ++i) {
		let j = page*ItemPerPage + i;
		if(j >= logs.length) break;
		
		j = logs.length-1-j;

		let node = createElement('li', {logIndex:j}, []);
		listNode.appendChild(node);
		
		loadMetadata(contract, logs[j].args.tokenId).then(async(meta)=>{
			let tx = await logs[j].getTransaction();
			
			let liNode = document.querySelector(`#tokens >li[logIndex="${j}"]`);
			
			let node = createElement('div', {'class':'item'}, [
				//createElement('a', {'class':'item', tokenId:tokenId, href:`./token.html#${tokenId}`}, [
					createElement('embed', {'class':'content', src:dataUri(tx.data.substr(2), meta.mimeType)}, ''),
					createElement('div', {'class':'name'}, [meta.name]),
				//]),
			]);
			
			liNode.appendChild(node);
		});
	}
}


document.querySelector('#drop').addEventListener('drop', async (ev)=>{
	ev.preventDefault();

	let file;
	
	if (ev.dataTransfer.items) {
		for(let i=0; i<ev.dataTransfer.items.length; ++i) {
			if (ev.dataTransfer.items[i].kind === 'file') {
				file = ev.dataTransfer.items[i].getAsFile();
				break;
			}
		}
	} else {
		file = ev.dataTransfer.files[0];
	}
	
	if(!file) return;
	
	let mimeType = file.type;
	
	let reader = new FileReader();
	reader.onloadend = async (e) => {
		let hex = hexEncode(e.target.result);
		let tokenId = ethers.utils.keccak256('0x'+hex);
		
		provider.getSigner().sendTransaction({to:ContractAddr, data:'0x'+hex}).then((tx)=>{
			tx.wait().then((receipt)=>{
				contract.setMimeType(tokenId, mimeType).then((tx2)=>{
					tx2.wait().then(()=>{
						location.reload();
					});
				});
			});
		});
	}
	reader.readAsArrayBuffer(file);
});

document.querySelector('#drop').addEventListener('dragover', (ev)=>{
	ev.preventDefault();
});



async function loadMetadata(contract, tokenId) {
	let uri = await contract.tokenURI(tokenId);
	let response = await fetch(uri);
	response = await response.json();
	response.tokenId = tokenId;
	return response;
}

function hexEncode(arrayBuffer) {
	return Array.prototype.map.call(
		new Uint8Array(arrayBuffer),
		(n) => (n.toString(16).padStart(2,'0'))
	).join('');
}

function base64Encode(hex) {
	return btoa(hex.match(/\w{2}/g).map((a)=>{
		return String.fromCharCode(parseInt(a, 16));
	}).join(''));
}

function dataUri(hex, mimeType) {
	if(!mimeType) {
		return `data:,0x` + hex;
	}
	return `data:${mimeType};base64,` + base64Encode(hex);
}