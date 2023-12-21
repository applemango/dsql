import { Database, Table, id, text } from "./sql";

const user = Table({
    id: id(),
    email: text(),
    password: text()
})

const article = Table({
    id: id(),
    user_id: user.id,
    content: text(),
})

const db = Database({
    user,
    article,
})

db.user.get("1")
console.log(user.get(1))