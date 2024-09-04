package main

import (
	"comment-system/db"
)

func main() {
	db.InitDB()      // 初始化数据库连接
	db.AutoMigrate() // 数据库迁移

	setupRoutes() // 设置路由
	startServer() // 启动服务器
}
