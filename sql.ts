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
    get(key: any): ObjItemOption<T> {
        const primaryKey = Object.keys(this.table as any).filter((key) => this.table[key].option.primary)[0] as any
        this.context.execute(`SELECT * FROM ${this.context.name} WHERE ${primaryKey} = ?`, [key])
        return undefined as any
        //return `SELECT * FROM ${this.label} WHERE ${primaryKey} = ${key}`
    }
    insert(obj: ObjItemOption<T>) {

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

type Tables = {
    [key: string]: any
}
export class DatabaseClass<T> {
    tables: Tables
    constructor(obj: Tables) {
        this.tables = obj
    }
}
export const DatabaseClassProxy = (tables: DatabaseClass<Tables>) => {
    return new Proxy(tables, {
        get(target, prop, receiver) {
            if(prop in tables.tables) {
                target.tables[prop as any].context = {
                    execute: (query: string, args: any[]) => {
                        console.log("EXECUTE: ", query, args)
                    },
                    name: prop as string
                }
                return Reflect.get(target.tables, prop, receiver);
            }
            return Reflect.get(target, prop, receiver);
        },
    })
}
export const Database = (obj: any): any => DatabaseClassProxy(new DatabaseClass(obj))