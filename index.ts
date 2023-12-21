import { Table, id, text } from "./sql";

const user = Table({
    id: id(),
    email: text(),
    password: text()
})

console.log(user.id)
console.log(user.comment)