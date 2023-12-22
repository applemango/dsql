type TableType<T> = {
    [key in keyof T]: SchemaType
}
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


type ObjItemOption<T> =  {
    [key in keyof T]?: T[key];
}
class TableClass<T> {
    table: TableType<T>
    context: {
        execute: (query: string, args: any[]) => Promise<any>,
        name: string,
    }
    constructor(table: TableType<T>) {
        this.table = table
    }
    async get(key: any): Promise<ObjItemOption<T>> {
        const primaryKey = Object.keys(this.table as any).filter((key) => this.table[key].option.primary)[0] as any
        const res = await this.context.execute(`SELECT * FROM ${this.context.name} WHERE ${primaryKey} = ?`, [key])
        return res
        //return `SELECT * FROM ${this.label} WHERE ${primaryKey} = ${key}`
    }
    insert(obj: ObjItemOption<T>) {

    }
    async sync() {

    }
}

type TableClassProxyResult<T> = {
    [key in keyof T]: SchemaType;
} & TableClass<T>
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
export class DatabaseClass<T> {
    tables: {
        [key in keyof T]: Table;
    }
    constructor(obj: {
        [key in keyof T]: Table;
    }) {
        this.tables = obj
        this.map((table, key)=> {
            table.context = {
                execute: async (query: string, args: any[]) => {
                    console.log("EXECUTE: ", query, args)
                },
                name: key
            }
        })
    }
    async map(fn: (table: Table, key: string, i: number)=> any) {
        return Object.keys(this.tables).map((key, i) => fn(this.tables[key], key, i))
    }
    async sync() {
        return this.map((table)=> {
            table
        })
    }
}
type DatabaseClassProxyResult<T> = {
    [key in keyof T]: Table;
} & DatabaseClass<T>
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
export const Database = <T>(obj: T) => DatabaseClassProxy<T>(new DatabaseClass(obj as any))