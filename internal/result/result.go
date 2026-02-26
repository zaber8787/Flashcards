package result

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"Flashcard/internal/database"
)

type SearchResult struct {
	Limit     int  `json:"limit"`
	Important bool `json:"important"`
	Start     int  `json:"start"`
}

func ResultAPIHandler(c *gin.Context) {
	var req SearchResult
	req.Limit = 20
	req.Start = 1

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Limit <= 0 {
		req.Limit = 20
	}
	if req.Start < 1 {
		req.Start = 1
	}

	vocabs := database.QueryVocabularies(req.Limit, req.Important, req.Start)
	c.JSON(http.StatusOK, vocabs)
}
