export class SchemaType {
    type: string
    option: {
        optional: boolean,
        primary: boolean,
        autoIncrement: boolean,
        notNull: boolean,
        isForagingKey: boolean,
        foragingTableName: string,
        foragingTableId: string,
        foragingColumnName: string,
        tableName: string,
        key: string
    }
    constructor(type: string) {
        this.type = type;
        this.option = {
            optional: true,
            primary: false,
            autoIncrement: false,
            notNull: false,
            isForagingKey: false,
            foragingTableName: "",
            foragingTableId: "",
            foragingColumnName: "",
            tableName: "",
            key: ""
        }
    }
    optional(): this {
        this.option.optional = true;
        return this
    }
    primary(): this {
        this.option.primary = true;
        return this
    }
    autoIncrement(): this {
        this.option.autoIncrement = true;
        return this
    }
    nonNull(): this {
        this.option.notNull = true;
        return this;
    }
    copy(): SchemaType {
        const copy = new SchemaType(this.type)
        copy.option = {
            ...this.option
        }
        return copy
    }
}
export const text = (): SchemaType => new SchemaType("TEXT")
export const id = (): SchemaType =>  new SchemaType("INTEGER").primary().autoIncrement()
export const num = (): SchemaType => new SchemaType("INTEGER")
export const bool = (): SchemaType => new SchemaType("BOOLEAN")
export const varchar = (length: number): SchemaType => new SchemaType(`VARCHAR(${length})`)