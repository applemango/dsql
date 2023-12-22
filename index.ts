import { Database, Table, id, text } from "./sql";
import { Database as DatabaseCore } from "bun:sqlite";

const database = new DatabaseCore("db.sqlite");

const user = Table({
    id: id(),
    email: text(),
    password: text()
})

const article = Table({
    like_id: id(),
    user_id: user.id,
    content: text(),
})

const db = Database({
    user,
    article,
}, {
    execute: async (query, args)=> {
        const statement = database.prepare(query)
        return await statement.all(args)
    }
})

/*db.user.insert({
    email: "user@example.com",
    password: "password"
})*/
console.log(await db.user.get(1))