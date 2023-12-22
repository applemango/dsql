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

class SqlStatement {
	query: Array<any>
	args: Array<any>
	constructor() {
		this.query= []
		this.args = []
	}
	toString(): string {
		return this.query.reduce((acc, v)=> acc.concat(v).concat(" "), "").trim()
	}
	execute(): [string, Array<any>] {
		const query = this.toString()
		return [query, this.args]
	}
}

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
type DatabaseClassOptions = ObjItemOption<{
    execute: (query: string, args: any[]) => Promise<any>,
}>
export class DatabaseClass<T> {
    tables: {
        [key in keyof T]: Table;
    }
    constructor(obj: {
        [key in keyof T]: Table;
    }, options?: DatabaseClassOptions) {
        this.tables = obj
        this.map((table, key)=> {
            table.context = {
                execute: options?.execute || (async (query: string, args: any[]) => {}),
                name: key
            }
        })
    }
    map(fn: (table: Table, key: string, i: number)=> Promise<any> | any) {
        return Object.keys(this.tables).map((key, i) => fn(this.tables[key], key, i))
    }
    async sync() {
        return Promise.all(this.map((table)=> {
            table.sync()
        }))
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
export const Database = <T>(obj: T, options?: DatabaseClassOptions) => DatabaseClassProxy<T>(new DatabaseClass(obj as any, options))