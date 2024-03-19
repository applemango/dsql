export class SchemaType {
    type: string
    option: {
        optional: boolean,
        primary: boolean,
        autoIncrement: boolean,
        notNull: boolean,
    }
    constructor(type: string) {
        this.type = type;
        this.option = {
            optional: true,
            primary: false,
            autoIncrement: false,
            notNull: false
        }
    }
    optional(): SchemaType {
        this.option.optional = true;
        return this
    }
    primary(): SchemaType {
        this.option.primary = true;
        return this
    }
    autoIncrement(): SchemaType {
        this.option.autoIncrement = true;
        return this
    }
    nonNull(): SchemaType {
        this.option.notNull = true;
        return this;
    }
}
export const text = (): SchemaType => new SchemaType("TEXT")
export const id = (): SchemaType =>  new SchemaType("INTEGER").primary().autoIncrement()
export const num = (): SchemaType => new SchemaType("INTEGER")
export const bool = (): SchemaType => new SchemaType("BOOLEAN")
export const varchar = (length: number): SchemaType => new SchemaType(`VARCHAR(${length})`)