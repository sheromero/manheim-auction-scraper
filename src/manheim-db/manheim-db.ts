import { Kysely, SqliteDialect, sql } from "kysely";
import SQLite, { Database } from "better-sqlite3";
import { ManheimDB, RawAuction, RawLot } from "./manheim-db.t.js";

function makeManheimDBConnection(path: string): Kysely<ManheimDB> {
    const dialect = new SqliteDialect({
        database: new SQLite(path),
    });

    const db = new Kysely<ManheimDB>({ dialect });

    return db;
}

export class DBController {
    db: Kysely<ManheimDB>;
    sqliteDB: Database;

    constructor(path: string) {
        this.db = makeManheimDBConnection(path);
        this.sqliteDB = new SQLite(path);
    }

    async createTables(): Promise<void> {
        await this.db.schema
            .createTable("rawAuction")
            .ifNotExists()
            .addColumn("auctionId", "text", (col) => col.notNull().primaryKey())
            .addColumn("timestamp", "text", (col) => col.notNull())
            .addColumn("rawHtml", "text", (col) => col.notNull())
            .modifyEnd(sql`strict`)
            .execute();

        await this.db.schema
            .createTable("rawLot")
            .ifNotExists()
            .addColumn("lotId", "integer", (col) => col.notNull().primaryKey())
            .addColumn("auctionId", "text", (col) => col.notNull())
            .addColumn("lotUrl", "text", (col) => col.notNull())
            .addColumn("rawHtml", "text", (col) => col.notNull())
            .addForeignKeyConstraint(
                "fkAuctionId",
                ["auctionId"],
                "rawAuction",
                ["auctionId"],
            )
            .modifyEnd(sql`strict`)
            .execute();
    }

    async upsertRawAuction(rawAuction: RawAuction): Promise<void> {
        await this.db
            .insertInto("rawAuction")
            .values(rawAuction)
            .onConflict((oc) => oc.column("auctionId").doUpdateSet(rawAuction))
            .execute();
    }

    async upsertRawLot(rawLot: RawLot): Promise<void> {
        await this.db
            .insertInto("rawLot")
            .values(rawLot)
            .onConflict((oc) => oc.column("lotId").doUpdateSet(rawLot))
            .execute()
    }
}
