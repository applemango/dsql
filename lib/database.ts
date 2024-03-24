import { ObjItemOption } from "../types/utils"
import { Table, Tables } from "./table"

type DatabaseClassOptions = ObjItemOption<{
    execute: (query: string, args?: any[]) => Promise<any>,
}>
export class DatabaseClass<T> {
    tables: Tables<T>
    execute: (query: string, args?: any[]) => Promise<any>
    constructor(obj: Tables<T>, options?: DatabaseClassOptions) {
        this.tables = obj
        this.execute =  options?.execute || (async (query: string, args?: any[]) => {})
        this.map((table, key)=> {
            table.context = {
                execute: this.execute,
                name: key
            }
            table.map((type)=> {
                type.option.tableName = key
                if(type.option.foragingTableId) {
                    type.option.foragingTableName = this
                        .map((table)=> table)
                        .find((table)=> table.uuid == type.option.foragingTableId)
                        ?.context.name
                }
            })
        })
    }
    map(fn: (table: Table, key: string, i: number)=> Promise<any> | any): Array<Promise<any> | any> {
        return Object.keys(this.tables).map((key, i) => fn(this.tables[key], key, i))
    }
    init() {
        this.map((table)=> {
            table.init()
        })
    }
    destroy() {
        this.map((table)=> {
            table.drop()
        })
    }
}
type DatabaseClassProxyResult<T> = { [key in keyof T]: T[key]; } & DatabaseClass<T>
export const DatabaseClassProxy = <T>(tables: DatabaseClass<T>): DatabaseClassProxyResult<T> => {
    return new Proxy(tables, {
        get(target, prop, receiver) {
            /*
             * if database.[table name]
             */
            if(prop in tables.tables) {
                return Reflect.get(target.tables, prop, receiver);
            }
            return Reflect.get(target, prop, receiver);
        },
    }) as any
}
export const Database = <T>(obj: T, options?: DatabaseClassOptions): DatabaseClassProxyResult<T> => {
    return DatabaseClassProxy<T>(new DatabaseClass(obj as any, options))
}