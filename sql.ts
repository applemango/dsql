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

class TableClass<T> {
    table: TableType<T>
    constructor(table: TableType<T>) {
        this.table = table
    }
    get(key: any) {
    }
    insert(obj: {
        [key in keyof T]?: T[key];
    }) {

    }
}

export const TableClassProxy = <T>(table: TableClass<T>): {
    [key in keyof T]: SchemaType;
} & TableClass<T> => {
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

class Sql {
    constructor() {

    }
}