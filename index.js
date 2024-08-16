const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const routes = require("./routes");
var path = require("path");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const compression = require("compression");
const winston = require("winston");
const cluster = require("cluster");
const os = require("os");

dotenv.config();

if (cluster.isMaster) {
    const numCPUs = os.cpus().length;
    console.log(`Master process ${process.pid} is running`);

    // สร้าง workers เท่ากับจำนวนคอร์ของ CPU
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // ถ้ามี worker ใดตาย ให้ log และสร้างใหม่
    cluster.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        console.log("Starting a new worker");
        cluster.fork();
    });
} else {
    const app = express();

    const port = process.env.APP_PORT || 3002;

    const corsOptions = {
        origin: process.env.CORS,
        credentials: true,
    };

    // สร้าง Logger ด้วย Winston
    const logger = winston.createLogger({
        level: "info",
        format: winston.format.json(),
        transports: [
            new winston.transports.File({
                filename: "error.log",
                level: "error",
            }),
            new winston.transports.File({ filename: "combined.log" }),
        ],
    });

    // ถ้าเป็นการพัฒนา ใช้ Console logging ด้วย
    if (process.env.NODE_ENV !== "production") {
        logger.add(
            new winston.transports.Console({
                format: winston.format.simple(),
            })
        );
    }

    app.use((req, res, next) => {
        logger.info(`Request received: ${req.method} ${req.url}`);
        next();
    });

    app.use((err, req, res, next) => {
        logger.error(`Error occurred: ${err.message}`);
        res.status(500).send("Something went wrong!");
    });

    app.use(
        compression({
            threshold: 1024, // บีบอัดเฉพาะข้อมูลที่ใหญ่กว่า 1KB
        })
    );
    app.use(bodyParser.json({ limit: "500mb" }));
    app.use(bodyParser.urlencoded({ extended: true, limit: "500mb" }));
    app.use(cors(corsOptions));
    app.use(express.json({ limit: "500mb" }));
    app.use(express.urlencoded({ limit: "500mb", extended: true }));

    app.use(fileUpload());
    // app.use("/static", express.static(__dirname + "/public"));
    app.use(process.env.URL_STATIC, express.static(__dirname + "/public"));

    app.use(routes);

    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}
