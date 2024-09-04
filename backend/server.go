package main

import (
	"comment-system/db"
	"encoding/json"
	"github.com/spf13/viper"
	"log"
	"net/http"
	"strconv"
)

func getCommentsHandler(w http.ResponseWriter, r *http.Request) {
	pageStr := r.URL.Query().Get("page")
	sizeStr := r.URL.Query().Get("size")

	page, _ := strconv.Atoi(pageStr)
	size, _ := strconv.Atoi(sizeStr)

	var comments []db.Comment
	var total int64

	db.DB.Model(&db.Comment{}).Count(&total)
	db.DB.Offset((page - 1) * size).Limit(size).Find(&comments)

	response := map[string]interface{}{
		"code": 0,
		"msg":  "success",
		"data": map[string]interface{}{
			"total":    total,
			"comments": comments,
		},
	}
	json.NewEncoder(w).Encode(response)
}

func addCommentHandler(w http.ResponseWriter, r *http.Request) {
	var newComment db.Comment
	json.NewDecoder(r.Body).Decode(&newComment)

	result := db.DB.Create(&newComment)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"code": 0,
		"msg":  "success",
		"data": newComment,
	}
	json.NewEncoder(w).Encode(response)
}

func deleteCommentHandler(w http.ResponseWriter, r *http.Request) {
	idStr := r.URL.Query().Get("id")
	id, _ := strconv.Atoi(idStr)

	result := db.DB.Delete(&db.Comment{}, id)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"code": 0,
		"msg":  "success",
		"data": nil,
	}
	json.NewEncoder(w).Encode(response)
}

func setupRoutes() {
	http.HandleFunc("/comment/get", corsMiddleware(getCommentsHandler))
	http.HandleFunc("/comment/add", corsMiddleware(addCommentHandler))
	http.HandleFunc("/comment/delete", corsMiddleware(deleteCommentHandler))
}

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

func startServer() {
	viper.SetConfigFile("config.json")
	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("无法读取配置文件: %v", err)
	}

	port := viper.GetString("server.port")
	log.Printf("服务器运行在端口 %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
