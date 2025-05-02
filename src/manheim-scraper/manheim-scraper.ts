import { promisify } from "node:util";
import {
    parseMainHtml,
    getAuctionMetaData,
    getPageLots,
    getLotId
} from "../manheim-parse/manheim-parser.js";

const sleep = promisify(setTimeout);
const manheimBaseUrl = "https://www.manheim.com.au";

type AuctionData = {
    auctionId: string;
    numLots: number;
    rawHtml: string;
};

type RawLotData = {
    lotId: number;
    rawHtml: string;
}

export async function fetchAuctionLinks(): Promise<string[]> {
    const mainHtml = await fetchMainHtml();

    const auctionHrefs = parseMainHtml(mainHtml);

    return auctionHrefs;
}

export async function getAuctionData(href: string): Promise<AuctionData> {
    const auctionHtml = await fetchAuctionHtml(href);

    const { auctionId, numLots } = getAuctionMetaData(auctionHtml);

    return { auctionId, numLots, rawHtml: auctionHtml };
}

export async function getAuctionLinkLots(
    link: string,
): Promise<string[]> {
    const html = await fetchAuctionHtml(link);

    return getPageLots(html);
}

async function fetchMainHtml(): Promise<string> {
    const res = await fetch(manheimBaseUrl);
    const html = await res.text();

    return html;
}

async function fetchAuctionHtml(href: string, {rowsPerPage=120} = {}): Promise<string> {
    const res = await fetch(`${manheimBaseUrl}${href}&rowsPerPage=${rowsPerPage}`);
    const html = await res.text();

    return html;
}

export async function fetchRawLotData(href: string): Promise<RawLotData> {
    const res = await fetch(`${manheimBaseUrl}${href}`);
    const html = await res.text();
    const lotId = getLotId(href);

    return {lotId, rawHtml: html};
}
