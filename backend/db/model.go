package db

import "log"

type Comment struct {
	ID      int    `json:"id" gorm:"primaryKey;autoIncrement"`
	Name    string `json:"name"`
	Content string `json:"content"`
}

func AutoMigrate() {
	err := DB.AutoMigrate(&Comment{})
	if err != nil {
		log.Fatalf("数据库迁移失败: %v", err)
	}
}
