class Table {
    constructor(db, name) {
        this.db = db;
        this.name = name;
        this.auth = null; // { "devices.fingerprint" : "hash" } || { "devices.user" : "id" }
        this.from = `FROM ${this.name} JOIN devices ON ${this.name}.device = devices.fingerprint`
    }
    objectsToString(object, separator = " AND ") {
        let list = []
        for(let item of object) {
            if(!Array.isArray(object)){
                for(let [key, value] in Object.entries(item)) {
                    list.push(`${key}='${value}'`);
                }
            }
            if(typeof item == "string") list.push(item);
        }
        const str = list.join(separator);
        return str
    }
    query(action, options = {"FROM" : "", "WHERE" : this.auth, "JOIN" : "", "GROUP BY" : "", "HAVING" : "", "ORDER BY" : "","fields":""}) {
        const verb = action.split(" ")[0];
        for(let [key, value] in Object.entries(options)) {
            if(key == "JOIN") continue;
            if(typeof value == "string") options[key] = `${key} ${value}`;
            else if(Array.isArray(value)) {
                if(key == "fields" || "INSERT INTO") options[key] = this.objectsToString(value, ", ");
                if(verb == "UPDATE") options[key] = this.objectsToString(value, ", ");      
                if(key == "WHERE") options[key] = this.objectsToString(value, " AND ");  
            }
            if(key == "WHERE" && options.FROM) options[key] = `${value} AND ${this.auth}`;
            if(key != "fields") options[key] = `${key} ${value}`;           
        }
        if(verb == "SELECT"){
            let Query = `${action} ${options.fields || "*"} ${options.FROM || this.from} ${options.JOIN} ${options.WHERE} ${options["GROUP BY"]} ${options.HAVING} ${options["ORDER BY"]}`;
            return Query;
        }
        else if (verb == "UPDATE"){
            let Query = `${action} ${this.name} SET ${options.fields} ${options.WHERE}`;
            return Query;
        }
        else if (verb == "DELETE"){
            let Query = `${action} ${this.name} ${options.WHERE}`;
            return Query;
        }
        else if (verb == "INSERT INTO") {
            let Query = `${action} ${this.name} VALUES (${options.fields})`;
            return Query;
        }
    
    }
    async create(values) {
        const result = await this.db.query(this.query("INSERT INTO", {"fields": values}));
        return result.lastInsertRowid;
    }
    async getId(conditions) {
        const row = await this.db.query(this.query("SELECT", {"WHERE": conditions,"fields":"id"})).first();
        return row.id;
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

    async createMultiple(students, classId) {
        const inserts = [];
        const errors = [];
        
        for (const student of students) {
            const [lastname, name] = student.split(" ");
            try {
                const id = await this.create([lastname, name, classId]);
                inserts.push({ id });
            } catch (err) {
                errors.push({ student, error: err.message });
            }
        }
        
        return { inserts, errors };
    }    
    async listByClassroom(classId) {
        const rows = await this.db.query(this.query("SELECT",{fields:"id, lastname, name", "WHERE": classId, "ORDER BY": "lastname, name"}));
        return rows.results;
    }
}
    
class Asistance extends Table {
    constructor(db,name) {
        super(db,name);
    }
    async listByDate(type, date) {
        /*
        type: {"subject" : id} || {"student.class": id}
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
function addAuth(tables){
    return (req, res, next) => {
        for(let table of Object.values(tables)) table.auth = req.session.passport;
        req.tables = tables;
        next();
    }
}
export {Table,Student, Asistance, addAuth};