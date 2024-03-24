import { SchemaType } from "../schema";
import { TableClass } from "../table";
import { createStatement } from "./sql";


export const createTableColumnSchema = (column: SchemaType): string => {
    return `
        ${column.option.key}
        ${column.type}
        ${column.option.primary ? "PRIMARY KEY " : ""}
        ${column.option.autoIncrement ? "AUTOINCREMENT " : ""}
        ${column.option.notNull ? "NOT NULL " : ""}
        ${column.option.isForagingKey ? `,
            FOREIGN KEY (
                ${column.option.key}
            )
            REFERENCES ${column.option.foragingTableName} (${column.option.foragingColumnName})
        ` : ""}
    `
}


export const createTableSchema = <T>(table: TableClass<T>) => {
    const statement = createStatement()
    statement.push("CREATE TABLE IF NOT EXISTS")
    statement.push(table.context.name)
    statement.push("(")
    table.map((column, key, i)=> {
        i && statement.push(",")
        statement.push(createTableColumnSchema(column))
    })
    statement.push(")")
    table.context.execute(statement.export(), [])
}

export const dropTableSchema = <T>(table: TableClass<T>) => {
    const statement = createStatement()
    statement.push("DROP TABLE IF EXISTS")
    statement.push(table.context.name)
    table.context.execute(statement.export(), [])
}