export const {
    NETWORK_CHAIN_ID,
    TOKEN_CONTRACT_ADDR,
    BETTING_CONTRACT_DEPLOYED_BLOCK,
    POLYSCAN_TX_BASE,
    POLYSCAN_ADDR_BASE,
} = process.env.NODE_ENV === 'production' ? {
    NETWORK_CHAIN_ID: '0x89',
    TOKEN_CONTRACT_ADDR: '0x8A953CfE442c5E8855cc6c61b1293FA648BAE472',
    BETTING_CONTRACT_DEPLOYED_BLOCK: 25894160,
    POLYSCAN_TX_BASE: 'https://polygonscan.com/tx/',
    POLYSCAN_ADDR_BASE: 'https://polygonscan.com/address/'
} : {
    NETWORK_CHAIN_ID: '0x13881',
    TOKEN_CONTRACT_ADDR: '0x232134d1e47F95d1F5cFd7C1FfFE76BE99eA037C',
    BETTING_CONTRACT_DEPLOYED_BLOCK: 25433902,
    POLYSCAN_TX_BASE: 'https://mumbai.polygonscan.com/tx/',
    POLYSCAN_ADDR_BASE: 'https://mumbai.polygonscan.com/address/'

};
