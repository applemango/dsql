import { Table, id, text } from "./sql";

const user = Table("user", {
    id: id(),
    email: text(),
    password: text()
})

console.log(user.get(1))