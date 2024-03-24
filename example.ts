import { Database as DatabaseCore } from "bun:sqlite";
import Database, { Table, id, text } from "./mod";
import { varchar } from "./lib/schema";
const database = new DatabaseCore("db.sqlite");

const URL = Table({
    id: id(),
    url: text(),
    uuid: varchar(32)
})

const db = Database({ URL }, {
    async execute(query, args) {
        const statement = database.prepare(query)
        return await statement.all(args)
    },
})

db.destroy()

db.init()

URL.insert({
    url: "https://i32.jp",
    uuid: crypto.randomUUID()
})

console.log(await URL.all())

const user = Table({
    id: id(),
    email: text(),
    password: text()
})

const article = Table({
    id: id(),
    body: text(),
    user_id: user.id,
})

const otherDB = Database({
    user,
    article,
}, {
    execute: async (query, args)=> {
        const statement = database.prepare(query)
        return await statement.all(args)
    }
})
otherDB.destroy()
otherDB.init()

const uA = await otherDB.user.insert({
    email: "test@i32.jp",
    password: "test"
})

const uB = await otherDB.user.insert({
    email: "test@abc.osaka",
    password: "example"
})

const aA = await otherDB.article.insert({
    user_id: uA.id,
    body: "こんにちは"
})
console.log(await user.all())