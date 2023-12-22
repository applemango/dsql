import { Database, Table, id, text } from "./sql";
const asserteq = (bool: boolean, label?: string) => {
    if(bool) return
    throw new Error(label || "Assertion failed")
}


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

db.user.get(1)
db.article.get(1)
/*
db.user.get(1)
db.user.insert({
    email: "email@example.com",
    password: "password"
})*/