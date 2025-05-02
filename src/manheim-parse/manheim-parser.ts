import { readFileSync } from "node:fs";
import * as cheerio from "cheerio";

export type AuctionMetaData = {
    auctionId: string;
    numLots: number;
};

export function parseMainHtml(html: string): string[] {
    const $ = cheerio.load(html);

    const auctionHrefs = $(".mobile-eventstables > .mb-side-container > a")
        .map((i, ele) => $(ele).attr("href"))
        .toArray();

    return auctionHrefs;
}

export function getAuctionMetaData(html: string): AuctionMetaData {
    const $ = cheerio.load(html);
    const auctionId = $("meta[name='WT.z_aucid']").attr("content");
    if (!auctionId) {
        throw new Error("Auction id is undefined!");
    }

    const numLotsStr = $("meta[name='WT.z_brwsno']").attr("content");
    if (!numLotsStr) {
        throw new Error(`Number of lots for ${auctionId} is undefined!`);
    }
    if (!/^\d+$/.test(numLotsStr)){
        throw new Error(`Number of lots for ${auctionId} is invalid: ${numLotsStr}`)
    }
    const numLots = parseInt(numLotsStr);

    return { auctionId, numLots };
}

export function getPageLots(html: string): string[] {
    const $ = cheerio.load(html);

    const pageLots = $(
        ".vehicle-item .vehicle-full-details > .card-header > div > a:not([class])",
    )
        .map((i, ele) => $(ele).attr("href"))
        .toArray();

    return pageLots;
}

/*
export function getLotId(html: string): number {
    const $ = cheerio.load(html);
    const $lotId = $(
        "input[name='BidItemID']",
    ).attr("value") ?? "";
    console.log(`Test lotId: ${$lotId}`);
    const lotId = parseInt($lotId);

    return lotId;
}
*/
export function getLotId(href: string): number {
    const lotIdStr = /^\/[\w-]+\/(\d+)(?:\/|$)/.exec(href)?.[1] ?? null;
    if (!lotIdStr) {
        throw new Error(`Invalid lot id string: ${lotIdStr}`)
    }
    const lotId = parseInt(lotIdStr)

    return lotId;
}
