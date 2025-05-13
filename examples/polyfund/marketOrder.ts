import { ethers } from "ethers";
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
import { Chain, ClobClient, Side } from "../../src";

dotenvConfig({ path: resolve(__dirname, "../../.env") });

const host = "https://clob.polymarket.com/";
const polyfund_host = "https://api.polyvaults.com/orders/create-order";

async function main() {

    //The manager/signer wallet
    const wallet = new ethers.Wallet(`${process.env.PK}`);

    //Your created fund contract address on PolyFund
    const fundAddress = "";

    //Total amount to spend
    const total = 5;

    const chainId = parseInt(`${Chain.POLYGON}`) as Chain;
    console.log(`Address: ${await wallet.getAddress()}, Fund: ${fundAddress} chainId: ${chainId}`);


    const clobClient = new ClobClient(host, chainId, wallet, undefined, 3, fundAddress);

    //The token you wish to buy/sell
    const NO = "36607113471569996610510210587643544433368464059729215157351610676318352063527";

    //First find out which price you can execute at
    const marketPrice = await clobClient.calculateMarketPrice(
        NO,
        Side.BUY,
        total,
    )

    //Round off the market price. PolyFund only supports two decimals for the price
    const roundedMarketPrice = Number(marketPrice.toFixed(2));

    //Calculate the amount you can buy for the total at market price
    const amount = total / marketPrice;
    const roundedAmount = Number(amount.toFixed(2));


    //Create the order for the client
    const order = await clobClient.createOrder({
        tokenID: NO,
        price: roundedMarketPrice,
        size: roundedAmount,
        side: Side.BUY,
    });

    //Send it to the server
    console.log(await sendOrderToServer(order));
}

async function sendOrderToServer(_order: any) {

    //Send the order to Polyfunds
    const response = await fetch(polyfund_host, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(_order)
    });
    return await response.json();
}

main();
