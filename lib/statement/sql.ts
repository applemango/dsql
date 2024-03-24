class Statement {
    statement: Array<string>
    constructor() {
        this.statement = []
    }
    push(value: string) {
        this.statement.push(value)
        return this
    }
    export() {
        return this.statement.join(" ")
    }
}
export const createStatement = () => new Statement()