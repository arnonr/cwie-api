module.exports = {
    apps: [
        {
            name: "cwie-api",
            script: "index.js",
            instances: "1",
            exec_mode: "cluster",
            autorestart: true,
            watch: false,
            // กำหนด path ของ log file
            output: "./logs/my-app-out.log", // stdout
            error: "./logs/my-app-error.log", // stderr
            log: "./logs/my-app-combined.log", // ทั้ง stdout และ stderr รวมกัน
            //   max_memory_restart: "2G",
            //   node_args: "--optimize_for_size --max-old-space-size=2048",
            load_balancing: {
                enabled: true,
                strategy: "round-robin",
                stable: true,
                sticky: true,
                relax_check: false,
            },
        },
    ],
};
