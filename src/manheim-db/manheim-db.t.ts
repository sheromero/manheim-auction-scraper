import {Insertable, Selectable, Updateable } from "kysely";

export type ManheimDB = {
    rawAuction: RawAuctionTable;
    rawLot: RawLotTable;
}

export type RawAuctionTable = {
    auctionId: string;
    timestamp: string;
    rawHtml: string;
};

export type RawAuction = Selectable<RawAuctionTable>;
export type NewRawAuction = Insertable<RawAuctionTable>;
export type UpdateRawAuction = Updateable<RawAuctionTable>;

export type RawLotTable = {
    lotId: number;
    auctionId: string
    lotUrl: string;
    rawHtml: string;
};

export type RawLot = Selectable<RawLotTable>;
export type NewRawLot = Insertable<RawLotTable>;
export type UpdateRawLot = Updateable<RawLotTable>;
