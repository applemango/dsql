import { ObjItemOption } from "../types/utils"
import { SchemaType } from "./schema"

export type TableType<T> = { [key in keyof T]: SchemaType }
export type Table = TableClass<any>
export type Tables<T> = { [key in keyof T]: Table; }

class TableClass<T> {
    table: TableType<T>
    context: {
        execute: (query: string, args: any[]) => Promise<any>,
        name: string,
    }
    constructor(table: TableType<T>) {
        this.table = table
    }
    getPrimaryKey(): string {
        return Object.keys(this.table).filter((key) => this.table[key].option.primary)[0]
    }
    map(fn: (table: SchemaType, key: string, i: number)=> Promise<any> | any): Array<Promise<any> | any> {
        return Object.keys(this.table).map((key, i) => fn(this.table[key], key, i))
    }
    async get(key: any): Promise<ObjItemOption<T>> {
        const primaryKey = this.getPrimaryKey()
        const res = await this.context.execute(`SELECT * FROM ${this.context.name} WHERE ${primaryKey} = ?`, [key])
        return res[0]
    }
    async insert(obj: ObjItemOption<T>) {
        await this.context.execute(
            `INSERT INTO ${this.context.name} (
                ${Object.keys(obj).join(", ")}
            ) VALUES ( ${Object.values(obj).map(()=> "?")} )`
        , Object.values(obj))
    }
    async all(): Promise<Array<ObjItemOption<T>>> {
        const res = await this.context.execute(`SELECT * FROM ${this.context.name}`, [])
        return res
    }
}
type TableClassProxyResult<T> = { [key in keyof T]: SchemaType; } & TableClass<T>
export const TableClassProxy = <T>(table: TableClass<T>): TableClassProxyResult<T> => {
    return new Proxy(table, {
        get: function(target, prop, receiver) {
            if(prop in table.table) {
                return Reflect.get(target.table, prop, receiver);
            }
            return Reflect.get(target, prop, receiver);
        }
    }) as any;
}
export const Table = <T>(table: TableType<T>): TableClassProxyResult<T> => TableClassProxy(new TableClass(table))