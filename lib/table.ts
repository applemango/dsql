import { ObjItemOption } from "../types/utils"
import { SchemaType } from "./schema"
import { createTableSchema, dropTableSchema } from "./statement/schema"

export type TableType<T> = { [key in keyof T]: SchemaType }
export type Table = TableClass<any>
export type Tables<T> = { [key in keyof T]: Table; }

export class TableClass<T> {
    table: TableType<T>
    uuid: string
    context: {
        execute: (query: string, args: any[]) => Promise<any>,
        name: string,
    }
    constructor(table: TableType<T>) {
        this.uuid = crypto.randomUUID()
        this.table = table
        this.map((table, key)=> {
            table.option.key = key
        })
    }
    getPrimaryKey(): string | undefined {
        return this.map((type)=> type)
            .find((type)=> type.option.primary)
            ?.option.key
    }
    map<T>(fn: (table: SchemaType, key: string, i: number)=> T): Array<T> {
        return Object.keys(this.table).map((key, i) => fn(this.table[key], key, i))
    }
    async get(key: any): Promise<ObjItemOption<T>> {
        const primaryKey = this.getPrimaryKey()
        const res = await this.context.execute(`SELECT * FROM ${this.context.name} WHERE ${primaryKey} = ?`, [key])
        return res[0]
    }
    async insert(obj: ObjItemOption<T>): Promise<ObjItemOption<T>> {
        await this.context.execute(
            `INSERT INTO ${this.context.name} (
                ${Object.keys(obj).join(", ")}
            ) VALUES ( ${Object.values(obj).map(()=> "?")} )`
        , Object.values(obj))
        return (await this.context.execute(`SELECT * FROM ${this.context.name} WHERE id = last_insert_rowid()`, []))[0]
    }
    async all(): Promise<Array<ObjItemOption<T>>> {
        const res = await this.context.execute(`SELECT * FROM ${this.context.name}`, [])
        return res
    }
    async init(): Promise<void> {
        createTableSchema(this)
        /*this.map((table, key)=> {
            console.log(key)
            createTableSchema(this)
            //const table = Reflect.get(this.table, key)
            //console.log(table)
        })*/
    }
    async drop(): Promise<void> {
        dropTableSchema(this)
    }
}
type TableClassProxyResult<T> = { [key in keyof T]: SchemaType; } & TableClass<T>
export const TableClassProxy = <T>(table: TableClass<T>): TableClassProxyResult<T> => {
    return new Proxy(table, {
        get: function(target, prop, receiver) {
            /*
             * user.id的な感じ
             */
            if(prop in table.table) {
                //table.table[prop].option.isForagingKey = true
                //table.table[prop].option.primary = false
                //return Reflect.get(target.table, prop, receiver);
                const copy = table.table[prop].copy()
                copy.option.isForagingKey = true
                copy.option.primary = false
                copy.option.autoIncrement = false
                copy.option.foragingColumnName = prop.toString()
                copy.option.foragingTableId = table.uuid
                return copy
            }
            return Reflect.get(target, prop, receiver);
        }
    }) as any;
}
export const Table = <T>(table: TableType<T>): TableClassProxyResult<T> => TableClassProxy(new TableClass(table))