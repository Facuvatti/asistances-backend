class Table {
    constructor(db, name) {
        this.db = db;
        this.name = name;
        this.user = null;
    }
    objectsToString(object, separator = " AND ", quotes = true) {
        let list = [];
        if (Array.isArray(object)) {
            if(quotes) {
                for(let value of object) {
                    if (!isNaN(value)) list.push(value);
                    else list.push(`'${value}'`);
                }
            } else list = object;
        }

        else if(typeof object == "object") {
            for(let [key, value] of Object.entries(object)) {
                list.push(`${key}='${value}'`);
            }
        }
        if(typeof object == "string") return object;
        const str = list.join(separator);
        return str
         
    }
    query(action, options = {}) {
        let firstWord;
        let Query = "";
        options = {...{"FROM" : "", "WHERE" : "", "JOIN" : "", "GROUP BY" : "", "HAVING" : "", "ORDER BY" : "","fields":"","columns":[]},...options};
        if(!this.user) throw new Error("Es necesario un usuario");
        const verb = action.split(" ")[0];
        options["WHERE"] = {...options["WHERE"], ...{user : this.user}};
        for(let [key, value] of Object.entries(options)) {
            if(key == "JOIN") continue;
            if(["fields","GROUP BY","HAVING" ,"ORDER BY"].includes(key) || ["INSERT", "UPDATE"].includes(verb)) options[key] = this.objectsToString(value, ", ");
            if(key == "columns") options[key] = this.objectsToString(value, ", ", false);
            if(key == "WHERE") options[key] = this.objectsToString(value, " AND ");  
            if(typeof options[key] == "string") firstWord = options[key].split(" ")[0];
            if(firstWord != key && value != "" && !["fields","columns"].includes(key)) options[key] = key + " " + options[key];
        }
        if(verb == "SELECT"){
            Query = `${action} ${options.fields || this.name+".*"} ${options.FROM || `FROM ${this.name}`} ${options.JOIN || ""} ${options.WHERE || ""} ${options["GROUP BY"] || ""} ${options.HAVING || ""} ${options["ORDER BY"] || ""}`;

        }
        else if (verb == "UPDATE"){
            Query = `${action} ${this.name} SET ${options.fields} ${options.WHERE}`;
        }
        else if (verb == "DELETE"){
            Query = `${action} ${this.name} ${options.WHERE}`;
        }
        else if (verb == "INSERT") {
            Query = `${action} ${this.name} (${options.columns}, user) VALUES (${options.fields}, ${this.user})`;
            
        }
        console.log(Query);
        return Query;
    
    }

    async create(row) {
        console.log(row);
        const exists = await this.db.query(this.query("SELECT", {"WHERE": row,"fields":"id"}));
        if (exists.length == 0 || !exists) {
            const result = await this.db.query(this.query("INSERT INTO", {"fields":Object.values(row), "columns": Object.keys(row)}));
            console.log(result, result[0].insertId);
            return result[0].insertId;
        }
        console.log("Ya existia");
        return exists[0].id;
    }
    async getId(conditions) {
        const row = await this.db.query(this.query("SELECT", {"WHERE": conditions,"fields":"id"}));
        console.log(row)
        return row.results[0];
    }
    async remove(id) {await this.db.query(this.query("DELETE", {"WHERE": "id = " + id}));}
    async list() {
        const rows = await this.db.query(this.query("SELECT"));
        return rows.results;
    }
    async listDistinct(condition) {
        const rows = await this.db.query(this.query("SELECT DISTINCT", {"fields": condition}));
        return rows.results;
    }
}

class Student extends Table {
    constructor(db,name) {
        super(db,name);
    }

    async createMultiple(students, course) {
        const inserts = [];
        const errors = [];
        
        for (const student of students) {
            const [lastname, name] = student.split(" ");
            try {
                const id = await this.create({lastname, name, course});
                console.log(id);
                inserts.push({ id });
            } catch (err) {
                errors.push({ student, error: err.message });
            }
        }
        
        return { inserts, errors };
    }    
    async listByCourse(courseId) {
        const rows = await this.db.query(this.query("SELECT",{fields:"id, lastname, name", "WHERE": courseId, "ORDER BY": "lastname, name"}));
        return rows.results;
    }
}
    
class Asistance extends Table {
    constructor(db,name) {
        super(db,name);
    }
    async listByDate(type, date) {
        /*
        type: {"subject" : id} || {"student.course": id}
        */
        let options = {};
        options.fields = `students.id AS student, students.lastname, students.name, ${this.name}.presence, ${this.name}.created AS date, ${this.name}.id`;
        options.JOIN = `JOIN students ON ${this.name}.student = students.id`;
        options.WHERE = {"DATE(created)": date};
        Object.assign(options.WHERE,type);
        const rows = await this.db.query(this.query("SELECT",options));
        return rows.results;
    }
    async listByStudent(studentId) {
        const rows = await this.db.query(
            `SELECT s.id as student, s.lastname, s.name, a.presence, a.created AS date, a.id
            FROM asistances a
            JOIN students s ON a.student = s.id
            WHERE a.student = ? 
            AND a.id IN (
                SELECT id
                FROM (
                    SELECT id,
                    MAX(datetime(created)) OVER (PARTITION BY date(created)) AS max_date
                    FROM asistances
                    WHERE student = ?
                    ) t
                    WHERE datetime(created) = max_date
                    )
                    ORDER BY a.created DESC;
            `,
            [studentId, studentId]
        );
        return rows.results;
    }
}
function addTables(tables){
    return (req, res, next) => {
        for(let table of Object.values(tables)) {
            table.user = req.user.id;
        }
        req.tables = tables;
    
        next();
    }
}
export {Table,Student, Asistance, addTables};