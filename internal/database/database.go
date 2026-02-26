package database

import (
	"errors"
	"log"
	"os"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	_ "modernc.org/sqlite"
)

var db *gorm.DB = nil

type Data struct {
	ID        int    `json:"id"        gorm:"column:id"`
	Word      string `json:"word"      gorm:"column:word"`
	Value     string `json:"value"     gorm:"column:value"`
	Symbol    string `json:"symbol"    gorm:"column:symbol"`
	Important bool   `json:"important" gorm:"column:important"`
	Roots     string `json:"roots"     gorm:"column:roots"`
}

func Init(dbFile string) {
	if _, err := os.Stat(dbFile); errors.Is(err, os.ErrNotExist) {
		log.Fatal("Database file does not exist")
		return
	}

	d, err := gorm.Open(sqlite.Dialector{
		DriverName: "sqlite",
		DSN:        dbFile + "?_pragma=foreign_keys(1)",
	}, &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		log.Fatal(err)
		return
	}
	db = d
}

// QueryVocabularies 從 start ID 開始回傳 limit 筆。
// important=true 時只回傳標記為重要的單字；false 時不篩選，全部回傳。
func QueryVocabularies(limit int, important bool, start int) []Data {
	var vocabs []Data
	q := db.Where("id >= ?", start)
	if important {
		q = q.Where("important = ?", true)
	}
	q.Order("id").Limit(limit).Find(&vocabs)
	return vocabs
}
