import { promisify } from "node:util";
import { DBController } from "./manheim-db/manheim-db.js";
import {
    fetchAuctionLinks,
    fetchRawLotData,
    getAuctionData,
    getAuctionLinkLots,
} from "./manheim-scraper/manheim-scraper.js";

const dbPath = "./manheim-db.sqlite";
const sleep = promisify(setTimeout);

async function main(): Promise<void> {
    const dbController = new DBController(dbPath);
    await dbController.createTables();

    const auctionLinks = await fetchAuctionLinks();

    for (const auctionLink of auctionLinks) {
        const { auctionId, numLots, rawHtml } = await getAuctionData(
            auctionLink,
        );

        console.log(`Upserting auction: ${auctionId}, ${auctionLink}`);
        await dbController.upsertRawAuction({
            auctionId,
            timestamp: new Date().toISOString(),
            rawHtml,
        });

        const numPages = Math.ceil(numLots / 120);

        for (var i = 1; i <= numPages; i++) {
            const currLink = auctionLink.replace("page1", `page${i}`);
            const pageLotLinks = await getAuctionLinkLots(currLink);

            for (const lotLink of pageLotLinks) {
                console.log(`   Fetching link: ${lotLink}`);
                const { lotId, rawHtml } = await fetchRawLotData(lotLink);

                console.log(
                    `   Upserting lot: ${lotId} for auction: ${auctionId}`,
                );
                await dbController.upsertRawLot({
                    lotId,
                    auctionId,
                    lotUrl: lotLink,
                    rawHtml,
                });
                await sleep(3000);
            }
        }

        await sleep(3000);
    }
}

main();
