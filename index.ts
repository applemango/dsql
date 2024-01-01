type TableType<T> = { [key in keyof T]: SchemaType }
class SchemaType {
    type: string
    option: {
        optional: boolean,
        primary: boolean,
        autoIncrement: boolean
    }
    constructor(type: string) {
        this.type = type;
        this.option = {
            optional: true,
            primary: false,
            autoIncrement: false
        }
    }
    optional() {
        this.option.optional = true;
        return this
    }
    primary() {
        this.option.primary = true;
        return this
    }
    autoIncrement() {
        this.option.autoIncrement = true;
        return this
    }
}
export const text = () => new SchemaType("TEXT")
export const id = () =>  new SchemaType("INTEGER").primary().autoIncrement()
export const num = () => new SchemaType("INTEGER")
export const bool = () => new SchemaType("BOOLEAN")
export const varchar = (length: number) => new SchemaType(`VARCHAR(${length})`)

type ObjItemOption<T> =  { [key in keyof T]?: T[key]; }
class TableClass<T> {
    table: TableType<T>
    context: {
        execute: (query: string, args: any[]) => Promise<any>,
        name: string,
    }
    constructor(table: TableType<T>) {
        this.table = table
    }
    getPrimaryKey() {
        return Object.keys(this.table).filter((key) => this.table[key].option.primary)[0]
    }
    map(fn: (table: SchemaType, key: string, i: number)=> Promise<any> | any) {
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
    async all() {
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
export const Table = <T>(table: TableType<T>) => TableClassProxy(new TableClass(table))

type Table = TableClass<any>
type DatabaseClassOptions = ObjItemOption<{
    execute: (query: string, args: any[]) => Promise<any>,
}>
type Tables<T> = { [key in keyof T]: Table; }
export class DatabaseClass<T> {
    tables: Tables<T>
    execute: (query: string, args: any[]) => Promise<any>
    constructor(obj: Tables<T>, options?: DatabaseClassOptions) {
        this.tables = obj
        this.execute =  options?.execute || (async (query: string, args: any[]) => {})
        this.map((table, key)=> {
            table.context = {
                execute: this.execute,
                name: key
            }
        })
    }
    map(fn: (table: Table, key: string, i: number)=> Promise<any> | any) {
        return Object.keys(this.tables).map((key, i) => fn(this.tables[key], key, i))
    }
}
type DatabaseClassProxyResult<T> = { [key in keyof T]: T[key]; } & DatabaseClass<T>
export const DatabaseClassProxy = <T>(tables: DatabaseClass<T>): DatabaseClassProxyResult<T> => {
    return new Proxy(tables, {
        get(target, prop, receiver) {
            if(prop in tables.tables) {
                return Reflect.get(target.tables, prop, receiver);
            }
            return Reflect.get(target, prop, receiver);
        },
    }) as any
}
export const Database = <T>(obj: T, options?: DatabaseClassOptions) => DatabaseClassProxy<T>(new DatabaseClass(obj as any, options))