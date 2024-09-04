package db

import (
	"log"

	"github.com/spf13/viper"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	viper.SetConfigFile("config.json")
	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("无法读取配置文件: %v", err)
	}

	dsn := viper.GetString("db.dsn")
	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("无法连接数据库: %v", err)
	}

	log.Println("数据库连接成功")
}
