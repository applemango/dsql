import { Table, id, text } from "./sql";

const user = Table({
    id: id(),
    email: text(),
    password: text()
})

user.insert({
    email: "string",
})