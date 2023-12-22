import { Database, Table, id, text } from "./sql";

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
})
console.log(await db.user.get(1))