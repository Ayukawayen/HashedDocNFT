const ContractAddr = '0xD743E610e1064Db11Dcecf74A31D7708D8C333c3';

let provider;
let account;

window.ethereum.request({
	method: 'eth_requestAccounts',
}).then((response)=>{
	account = response[0];
	
	window.ethereum.request({
		method: 'wallet_switchEthereumChain',
		params: [{ chainId: '0x4' }],
		//params: [{ chainId: '0x2710' }],
	}).then(async (response)=>{
		
		provider = new ethers.providers.Web3Provider(window.ethereum);
		
		if(typeof(onAdapterLoad) != 'undefined') {
			onAdapterLoad();
		}
	}).catch((err)=>{
		alert(err.message);
	});
});
