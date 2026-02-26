package main

import (
	"log"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"Flashcard/internal/database"
	"Flashcard/internal/result"
)

func main() {
	setGinMode()

	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	workdir, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}

	dbFile := getOrDefault("DATABASE_FILE", workdir+"/database.db")
	dbPath := filepath.Join(workdir, dbFile)
	log.Printf("Using database file: %s", dbPath)
	database.Init(dbPath)

	r := gin.Default()

	// 靜態資源
	r.LoadHTMLGlob(workdir + "/static/view/*")
	r.Static("/static", "./static")
	r.Static("/css", workdir+"/static/CSS")
	r.Static("/js", workdir+"/static/js")

	// 首頁
	r.GET("/", func(c *gin.Context) {
		c.HTML(200, "index.html", nil)
	})

	// 結果頁面
	r.GET("/result", func(c *gin.Context) {
		c.HTML(200, "result.html", nil)
	})

	// API: 查詢單字
	r.POST("/api/result", func(c *gin.Context) {
		result.ResultAPIHandler(c)
	})

	port := getOrDefault("PORT", "8080")
	log.Printf("Server starting on :%s", port)
	r.Run(":" + port)
}

func getOrDefault(key string, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func setGinMode() {
	switch os.Getenv("GIN_MODE") {
	case "release":
		gin.SetMode(gin.ReleaseMode)
	case "debug":
		gin.SetMode(gin.DebugMode)
	case "test":
		log.Fatal("GIN_MODE=test is not supported")
		os.Exit(1)
	default:
		gin.SetMode(gin.DebugMode)
		log.Println("GIN_MODE not set, using debug mode")
	}
}
