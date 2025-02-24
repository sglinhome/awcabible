//db

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseService {
    static db = null;

    static initialize() {
        return new Promise((resolve, reject) => {
            try {
                const dbPath = path.join(__dirname, '../../database.sqlite');
                this.db = new sqlite3.Database(dbPath, (err) => {
                    if (err) {
                        console.error('数据库连接失败:', err);
                        reject(err);
                        return;
                    }
                    
                    this.createTables()
                        .then(resolve)
                        .catch(reject);
                });
            } catch (error) {
                console.error('数据库初始化失败:', error);
                reject(error);
            }
        });
    }

    static async createTables() {
        const queries = [
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                isRead INTEGER DEFAULT 1,
                unreadDays INTEGER DEFAULT 0,
                frozen INTEGER DEFAULT 0
            )`,
            `CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )`
        ];

        for (const query of queries) {
            await this.run(query);
        }
    }

    static run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    static get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static close() {
        if (this.db) {
            return new Promise((resolve, reject) => {
                this.db.close((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
    }
}

module.exports = DatabaseService;
